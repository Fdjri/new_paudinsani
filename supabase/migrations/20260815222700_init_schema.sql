-- 1. Custom Types (Enums)
CREATE TYPE user_role AS ENUM ('kepala_sekolah', 'bendahara', 'operator', 'guru');
CREATE TYPE jenis_kelamin_type AS ENUM ('Laki-laki', 'Perempuan');
CREATE TYPE status_siswa AS ENUM ('aktif', 'lulus', 'keluar');
CREATE TYPE tipe_murid_type AS ENUM ('Siswa Baru', 'Mutasi');
CREATE TYPE status_absensi AS ENUM ('Hadir', 'Sakit', 'Izin', 'Alpa');
CREATE TYPE tipe_keuangan AS ENUM ('pemasukan', 'pengeluaran');
CREATE TYPE status_pembayaran AS ENUM ('Lunas', 'Belum Lunas', 'Cicil');

-- 2.1 users
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    nama          TEXT NOT NULL,
    nik           TEXT UNIQUE NOT NULL,
    username      TEXT UNIQUE NOT NULL,
    foto          TEXT,                                    -- path di Supabase Storage
    tanggal_lahir DATE NOT NULL,
    nomor_anggota TEXT UNIQUE,
    pendidikan    TEXT,
    npwp          TEXT,
    periode       TEXT,
    role          user_role NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- 2.2 kelas
CREATE TABLE kelas (
    id          BIGSERIAL PRIMARY KEY,
    nama_kelas  TEXT UNIQUE NOT NULL,                      -- 'A' atau 'B'
    guru_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 siswas
CREATE TABLE siswas (
    id                              BIGSERIAL PRIMARY KEY,
    foto                            TEXT,
    nis                             TEXT UNIQUE NOT NULL,
    nik                             TEXT UNIQUE,
    no_kk                           TEXT,
    nama_lengkap                    TEXT NOT NULL,
    nama_panggilan                  TEXT,
    jenis_kelamin                   jenis_kelamin_type NOT NULL,
    tanggal_lahir                   DATE NOT NULL,
    agama                           TEXT,
    kewarganegaraan                 TEXT DEFAULT 'Indonesia',
    anak_ke                         INTEGER,
    jumlah_saudara_kandung          INTEGER,
    bahasa_sehari_hari              TEXT,
    berat_badan                     REAL,
    tinggi_badan                    REAL,
    golongan_darah                  TEXT,
    penyakit_yang_pernah_diderita   TEXT,
    alamat_tempat_tinggal           TEXT NOT NULL,
    nomor_telp                      TEXT,
    jarak_tempat_tinggal_ke_sekolah TEXT,

    -- Data Ayah
    nama_ayah_kandung   TEXT,
    pendidikan_ayah     TEXT,
    pekerjaan_ayah      TEXT,

    -- Data Ibu
    nama_ibu_kandung    TEXT,
    pendidikan_ibu      TEXT,
    pekerjaan_ibu       TEXT,

    -- Data Wali
    nama_wali           TEXT,
    pendidikan_wali     TEXT,
    pekerjaan_wali      TEXT,
    hubungan_wali       TEXT,

    -- Status
    tipe_murid          tipe_murid_type NOT NULL DEFAULT 'Siswa Baru',
    status              status_siswa NOT NULL DEFAULT 'aktif',
    tahun_masuk         INTEGER,
    kelas_id            BIGINT REFERENCES kelas(id) ON DELETE SET NULL,

    -- Soft delete
    deleted_at          TIMESTAMPTZ,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_siswas_status ON siswas(status);
CREATE INDEX idx_siswas_kelas ON siswas(kelas_id);
CREATE INDEX idx_siswas_nama ON siswas(nama_lengkap);
CREATE INDEX idx_siswas_tahun_masuk ON siswas(tahun_masuk);

-- 2.4 absensis
CREATE TABLE absensis (
    id                BIGSERIAL PRIMARY KEY,
    siswa_id          BIGINT NOT NULL REFERENCES siswas(id) ON DELETE CASCADE,
    tanggal_absensi   DATE NOT NULL,
    status            status_absensi NOT NULL DEFAULT 'Hadir',
    keterangan        TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(siswa_id, tanggal_absensi)
);
CREATE INDEX idx_absensis_tanggal ON absensis(tanggal_absensi);
CREATE INDEX idx_absensis_siswa ON absensis(siswa_id);

-- 2.5 pembayarans
CREATE TABLE pembayarans (
    id                  BIGSERIAL PRIMARY KEY,
    siswa_id            BIGINT NOT NULL REFERENCES siswas(id) ON DELETE CASCADE,
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,   -- pencatat
    jenis_pembayaran    TEXT NOT NULL DEFAULT 'SPP',
    tahun_ajaran        INTEGER NOT NULL,
    bulan_pembayaran    INTEGER NOT NULL CHECK (bulan_pembayaran BETWEEN 1 AND 12),
    jumlah_bayar        DECIMAL(10,2) NOT NULL,
    tanggal_bayar       DATE NOT NULL,
    status              status_pembayaran NOT NULL DEFAULT 'Lunas',
    keterangan          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(siswa_id, tahun_ajaran, bulan_pembayaran, jenis_pembayaran)
);
CREATE INDEX idx_pembayarans_siswa ON pembayarans(siswa_id);
CREATE INDEX idx_pembayarans_tahun_bulan ON pembayarans(tahun_ajaran, bulan_pembayaran);

-- 2.6 keuangans
CREATE TABLE keuangans (
    id          BIGSERIAL PRIMARY KEY,
    deskripsi   TEXT NOT NULL,
    tipe        tipe_keuangan NOT NULL,
    tanggal     DATE NOT NULL,
    jumlah      INTEGER NOT NULL DEFAULT 1,
    biaya       DECIMAL(15,2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_keuangans_tanggal ON keuangans(tanggal);
CREATE INDEX idx_keuangans_tipe ON keuangans(tipe);

-- 2.7 settings
CREATE TABLE settings (
    key         TEXT PRIMARY KEY,
    value       JSONB NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.1 Auto-assign Kelas berdasarkan Umur
CREATE OR REPLACE FUNCTION auto_assign_kelas()
RETURNS TRIGGER AS $$
DECLARE
    umur_bulan INTEGER;
    target_kelas_id BIGINT;
BEGIN
    IF NEW.kelas_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    umur_bulan := (EXTRACT(YEAR FROM age(now(), NEW.tanggal_lahir)) * 12
                 + EXTRACT(MONTH FROM age(now(), NEW.tanggal_lahir)))::INTEGER;

    IF umur_bulan >= 48 AND umur_bulan < 66 THEN
        SELECT id INTO target_kelas_id FROM kelas WHERE nama_kelas = 'A' LIMIT 1;
    ELSIF umur_bulan >= 66 AND umur_bulan < 84 THEN
        SELECT id INTO target_kelas_id FROM kelas WHERE nama_kelas = 'B' LIMIT 1;
    END IF;

    IF target_kelas_id IS NOT NULL THEN
        NEW.kelas_id := target_kelas_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_assign_kelas
    BEFORE INSERT ON siswas
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_kelas();

-- 4.2 Auto-update updated_at Timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_kelas_updated_at BEFORE UPDATE ON kelas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_siswas_updated_at BEFORE UPDATE ON siswas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_absensis_updated_at BEFORE UPDATE ON absensis FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pembayarans_updated_at BEFORE UPDATE ON pembayarans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_keuangans_updated_at BEFORE UPDATE ON keuangans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4.3 Helper: Get Keuangan Summary
CREATE OR REPLACE FUNCTION get_keuangan_summary(
    p_tahun INTEGER DEFAULT NULL,
    p_bulan INTEGER DEFAULT NULL
)
RETURNS TABLE (
    total_pemasukan DECIMAL,
    total_pengeluaran DECIMAL,
    total_dana DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(CASE WHEN k.tipe = 'pemasukan' THEN k.jumlah * k.biaya ELSE 0 END), 0) AS total_pemasukan,
        COALESCE(SUM(CASE WHEN k.tipe = 'pengeluaran' THEN k.jumlah * k.biaya ELSE 0 END), 0) AS total_pengeluaran,
        COALESCE(SUM(CASE WHEN k.tipe = 'pemasukan' THEN k.jumlah * k.biaya ELSE -(k.jumlah * k.biaya) END), 0) AS total_dana
    FROM keuangans k
    WHERE (p_tahun IS NULL OR EXTRACT(YEAR FROM k.tanggal) = p_tahun)
      AND (p_bulan IS NULL OR EXTRACT(MONTH FROM k.tanggal) = p_bulan);
END;
$$ LANGUAGE plpgsql;

-- 5. Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE siswas ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensis ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayarans ENABLE ROW LEVEL SECURITY;
ALTER TABLE keuangans ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
    SELECT role FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
    SELECT id FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "users_select" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_insert" ON users FOR INSERT TO authenticated
    WITH CHECK (get_user_role() IN ('kepala_sekolah', 'operator'));
CREATE POLICY "users_update" ON users FOR UPDATE TO authenticated
    USING (get_user_role() IN ('kepala_sekolah', 'operator') OR id = get_user_id());
CREATE POLICY "users_delete" ON users FOR DELETE TO authenticated
    USING (get_user_role() IN ('kepala_sekolah', 'operator'));

CREATE POLICY "kelas_select" ON kelas FOR SELECT TO authenticated USING (true);
CREATE POLICY "kelas_modify" ON kelas FOR ALL TO authenticated
    USING (get_user_role() IN ('kepala_sekolah', 'operator'));

CREATE POLICY "siswas_select" ON siswas FOR SELECT TO authenticated USING (true);
CREATE POLICY "siswas_insert" ON siswas FOR INSERT TO authenticated
    WITH CHECK (get_user_role() IN ('kepala_sekolah', 'operator'));
CREATE POLICY "siswas_update" ON siswas FOR UPDATE TO authenticated
    USING (get_user_role() IN ('kepala_sekolah', 'operator'));
CREATE POLICY "siswas_delete" ON siswas FOR DELETE TO authenticated
    USING (get_user_role() IN ('kepala_sekolah', 'operator'));

CREATE POLICY "absensis_select" ON absensis FOR SELECT TO authenticated USING (true);
CREATE POLICY "absensis_modify" ON absensis FOR ALL TO authenticated
    USING (get_user_role() IN ('kepala_sekolah', 'guru'));

CREATE POLICY "pembayarans_select" ON pembayarans FOR SELECT TO authenticated USING (true);
CREATE POLICY "pembayarans_modify" ON pembayarans FOR ALL TO authenticated
    USING (get_user_role() IN ('kepala_sekolah', 'bendahara'));

CREATE POLICY "keuangans_select" ON keuangans FOR SELECT TO authenticated USING (true);
CREATE POLICY "keuangans_modify" ON keuangans FOR ALL TO authenticated
    USING (get_user_role() IN ('kepala_sekolah', 'bendahara'));

CREATE POLICY "settings_select" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_modify" ON settings FOR ALL TO authenticated
    USING (get_user_role() = 'kepala_sekolah');

-- 6. Seed Data
INSERT INTO kelas (nama_kelas) VALUES ('A'), ('B');

INSERT INTO settings (key, value) VALUES
    ('spp_nominal', '300000'),
    ('nama_sekolah', '"PAUD Insani"'),
    ('alamat_sekolah', '"Alamat sekolah PAUD Insani"');

-- 7. Storage Buckets Setup
-- Since these are just buckets, they are in the storage.buckets table.
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('siswa-photos', 'siswa-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can update their own avatar." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Siswa photos are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'siswa-photos');
CREATE POLICY "Anyone can upload a siswa photo." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'siswa-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can update a siswa photo." ON storage.objects FOR UPDATE USING (bucket_id = 'siswa-photos' AND auth.role() = 'authenticated');
