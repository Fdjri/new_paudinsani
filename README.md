# Sistem Informasi Akademik & Keuangan PAUD Insani

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

Sistem Informasi terpadu berbasis *web* yang dibangun secara eksklusif untuk **PAUD Insani** guna mendigitalisasi operasional sekolah dari hulu ke hilir. Proyek ini merupakan suksesor modern dari sistem *legacy* berbasis Laravel, dibangun kembali dengan *tech-stack* mutakhir (Next.js 14 App Router + Supabase) untuk menjamin skalabilitas, kecepatan, dan keamanan data tingkat tinggi.

---

## Fitur Unggulan

Sistem ini menganut prinsip *Role-Based Access Control* (RBAC), membatasi layar berdasarkan tingkat wewenang (Kepala Sekolah, Bendahara, Operator, dan Guru).

### 1. Manajemen Siswa & Guru
- Pendataan komprehensif profil siswa, riwayat orang tua/wali, hingga status aktif/alumni.
- **Auto-Assign Kelas Pintar**: Sistem secara otomatis mengkalkulasi umur anak dari *tanggal lahir* saat pendaftaran, lalu mengelompokkannya ke **Kelas A** (Usia 4-5.5 Tahun) atau **Kelas B** (Usia 5.5-7 Tahun).
- Pengarsipan staf pendidik dan kependidikan dengan NIK terenkripsi.

### 2. Sistem Presensi Berbasis Kalender Pintar
- Guru dan Kepsek dimudahkan dengan antarmuka absensi berbasis *Calendar-View*.
- **Integrasi API Hari Libur**: Sistem mencegah (*block*) input absensi pada akhir pekan (*weekend*) atau tanggal merah secara otomatis.

### 3. Finansial & Pembayaran (SPP)
- **Modul SPP Bulanan**: Penandaan tagihan lunas/tunggakan dalam satu layar grid.
- **Arus Kas (Keuangan)**: Pencatatan debet/kredit pengeluaran sekolah.
- **Ekspor Excel Pintar**: Laporan neraca bulanan maupun tahunan yang dapat diunduh (format `.xlsx`) dalam 1 klik.

### 4. Dashboard Analitik
Berbeda layar, berbeda metrik! 
- *Kepala Sekolah* disuguhi grafik batang pertumbuhan siswa dari tahun ke tahun serta kurva garis perbandingan arus kas.
- *Guru* langsung melihat grafik diagram donat (*donut chart*) tentang kesehatan absensi kelasnya.

---

## Tech Stack & Infrastruktur

- **Framework Utama**: [Next.js 14+](https://nextjs.org/) dengan paradigma *App Router* dan *React Server Components* (RSC).
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL 15), diamankan ketat dengan *Row Level Security* (RLS).
- **Storage**: Supabase Storage Bucket, dikombinasikan dengan [browser-image-compression](https://www.npmjs.com/package/browser-image-compression) untuk merampingkan ukuran unggahan foto profil langsung di klien (*client-side*).
- **Styling**: [TailwindCSS](https://tailwindcss.com/) dengan palet kustom elegan.
- **Visualisasi Data**: [Recharts](https://recharts.org/) yang responsif.
- **Deployment**: [Vercel](https://vercel.com).

---

## Panduan Instalasi (Development)

Jika Anda adalah developer yang ingin menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

### Prasyarat
- [Node.js](https://nodejs.org/en/) 18+ terinstal.
- Proyek [Supabase](https://supabase.com/) telah dibuat.

### 1. Kloning Repositori
```bash
git clone https://github.com/Fdjri/new_paudinsani
cd paud_insani
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan
Buat file bernama `.env.local` di _root directory_ proyek Anda. Isi dengan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_SUPABASE_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SUPABASE_SERVICE_ROLE_KEY] # (Hanya untuk skrip migrasi data)
```

### 4. Setup Database
Pastikan Anda mengeksekusi skema SQL yang ada di dalam `supabase/migrations/20260815222700_init_schema.sql` pada SQL Editor Supabase Anda untuk membentuk kerangka tabel, relasi, RLS, hingga *Trigger Database*.

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.