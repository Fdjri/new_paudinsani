export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      absensis: {
        Row: {
          created_at: string
          id: number
          keterangan: string | null
          siswa_id: number
          status: Database["public"]["Enums"]["status_absensi"]
          tanggal_absensi: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          keterangan?: string | null
          siswa_id: number
          status?: Database["public"]["Enums"]["status_absensi"]
          tanggal_absensi: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          keterangan?: string | null
          siswa_id?: number
          status?: Database["public"]["Enums"]["status_absensi"]
          tanggal_absensi?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "absensis_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswas"
            referencedColumns: ["id"]
          },
        ]
      }
      kelas: {
        Row: {
          created_at: string
          guru_id: string | null
          id: number
          nama_kelas: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guru_id?: string | null
          id?: number
          nama_kelas: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guru_id?: string | null
          id?: number
          nama_kelas?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kelas_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      keuangans: {
        Row: {
          biaya: number
          created_at: string
          deskripsi: string
          id: number
          jumlah: number
          tanggal: string
          tipe: Database["public"]["Enums"]["tipe_keuangan"]
          updated_at: string
        }
        Insert: {
          biaya: number
          created_at?: string
          deskripsi: string
          id?: number
          jumlah?: number
          tanggal: string
          tipe: Database["public"]["Enums"]["tipe_keuangan"]
          updated_at?: string
        }
        Update: {
          biaya?: number
          created_at?: string
          deskripsi?: string
          id?: number
          jumlah?: number
          tanggal?: string
          tipe?: Database["public"]["Enums"]["tipe_keuangan"]
          updated_at?: string
        }
        Relationships: []
      }
      pembayarans: {
        Row: {
          bulan_pembayaran: number
          created_at: string
          id: number
          jenis_pembayaran: string
          jumlah_bayar: number
          keterangan: string | null
          siswa_id: number
          status: Database["public"]["Enums"]["status_pembayaran"]
          tahun_ajaran: number
          tanggal_bayar: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bulan_pembayaran: number
          created_at?: string
          id?: number
          jenis_pembayaran?: string
          jumlah_bayar: number
          keterangan?: string | null
          siswa_id: number
          status?: Database["public"]["Enums"]["status_pembayaran"]
          tahun_ajaran: number
          tanggal_bayar: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bulan_pembayaran?: number
          created_at?: string
          id?: number
          jenis_pembayaran?: string
          jumlah_bayar?: number
          keterangan?: string | null
          siswa_id?: number
          status?: Database["public"]["Enums"]["status_pembayaran"]
          tahun_ajaran?: number
          tanggal_bayar?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pembayarans_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pembayarans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      siswas: {
        Row: {
          agama: string | null
          alamat_tempat_tinggal: string
          anak_ke: number | null
          bahasa_sehari_hari: string | null
          berat_badan: number | null
          created_at: string
          deleted_at: string | null
          foto: string | null
          golongan_darah: string | null
          hubungan_wali: string | null
          id: number
          jarak_tempat_tinggal_ke_sekolah: string | null
          jenis_kelamin: Database["public"]["Enums"]["jenis_kelamin_type"]
          jumlah_saudara_kandung: number | null
          kelas_id: number | null
          kewarganegaraan: string | null
          nama_ayah_kandung: string | null
          nama_ibu_kandung: string | null
          nama_lengkap: string
          nama_panggilan: string | null
          nama_wali: string | null
          nik: string | null
          nis: string
          no_kk: string | null
          nomor_telp: string | null
          pekerjaan_ayah: string | null
          pekerjaan_ibu: string | null
          pekerjaan_wali: string | null
          pendidikan_ayah: string | null
          pendidikan_ibu: string | null
          pendidikan_wali: string | null
          penyakit_yang_pernah_diderita: string | null
          status: Database["public"]["Enums"]["status_siswa"]
          tahun_masuk: number | null
          tanggal_lahir: string
          tinggi_badan: number | null
          tipe_murid: Database["public"]["Enums"]["tipe_murid_type"]
          updated_at: string
        }
        Insert: {
          agama?: string | null
          alamat_tempat_tinggal: string
          anak_ke?: number | null
          bahasa_sehari_hari?: string | null
          berat_badan?: number | null
          created_at?: string
          deleted_at?: string | null
          foto?: string | null
          golongan_darah?: string | null
          hubungan_wali?: string | null
          id?: number
          jarak_tempat_tinggal_ke_sekolah?: string | null
          jenis_kelamin: Database["public"]["Enums"]["jenis_kelamin_type"]
          jumlah_saudara_kandung?: number | null
          kelas_id?: number | null
          kewarganegaraan?: string | null
          nama_ayah_kandung?: string | null
          nama_ibu_kandung?: string | null
          nama_lengkap: string
          nama_panggilan?: string | null
          nama_wali?: string | null
          nik?: string | null
          nis: string
          no_kk?: string | null
          nomor_telp?: string | null
          pekerjaan_ayah?: string | null
          pekerjaan_ibu?: string | null
          pekerjaan_wali?: string | null
          pendidikan_ayah?: string | null
          pendidikan_ibu?: string | null
          pendidikan_wali?: string | null
          penyakit_yang_pernah_diderita?: string | null
          status?: Database["public"]["Enums"]["status_siswa"]
          tahun_masuk?: number | null
          tanggal_lahir: string
          tinggi_badan?: number | null
          tipe_murid?: Database["public"]["Enums"]["tipe_murid_type"]
          updated_at?: string
        }
        Update: {
          agama?: string | null
          alamat_tempat_tinggal?: string
          anak_ke?: number | null
          bahasa_sehari_hari?: string | null
          berat_badan?: number | null
          created_at?: string
          deleted_at?: string | null
          foto?: string | null
          golongan_darah?: string | null
          hubungan_wali?: string | null
          id?: number
          jarak_tempat_tinggal_ke_sekolah?: string | null
          jenis_kelamin?: Database["public"]["Enums"]["jenis_kelamin_type"]
          jumlah_saudara_kandung?: number | null
          kelas_id?: number | null
          kewarganegaraan?: string | null
          nama_ayah_kandung?: string | null
          nama_ibu_kandung?: string | null
          nama_lengkap?: string
          nama_panggilan?: string | null
          nama_wali?: string | null
          nik?: string | null
          nis?: string
          no_kk?: string | null
          nomor_telp?: string | null
          pekerjaan_ayah?: string | null
          pekerjaan_ibu?: string | null
          pekerjaan_wali?: string | null
          pendidikan_ayah?: string | null
          pendidikan_ibu?: string | null
          pendidikan_wali?: string | null
          penyakit_yang_pernah_diderita?: string | null
          status?: Database["public"]["Enums"]["status_siswa"]
          tahun_masuk?: number | null
          tanggal_lahir?: string
          tinggi_badan?: number | null
          tipe_murid?: Database["public"]["Enums"]["tipe_murid_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "siswas_kelas_id_fkey"
            columns: ["kelas_id"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string
          foto: string | null
          id: string
          nama: string
          nik: string
          nomor_anggota: string | null
          npwp: string | null
          pendidikan: string | null
          periode: string | null
          role: Database["public"]["Enums"]["user_role"]
          tanggal_lahir: string
          updated_at: string
          username: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          foto?: string | null
          id?: string
          nama: string
          nik: string
          nomor_anggota?: string | null
          npwp?: string | null
          pendidikan?: string | null
          periode?: string | null
          role: Database["public"]["Enums"]["user_role"]
          tanggal_lahir: string
          updated_at?: string
          username: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          foto?: string | null
          id?: string
          nama?: string
          nik?: string
          nomor_anggota?: string | null
          npwp?: string | null
          pendidikan?: string | null
          periode?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tanggal_lahir?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_keuangan_summary: {
        Args: { p_bulan?: number; p_tahun?: number }
        Returns: {
          total_dana: number
          total_pemasukan: number
          total_pengeluaran: number
        }[]
      }
      get_user_id: { Args: never; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      jenis_kelamin_type: "Laki-laki" | "Perempuan"
      status_absensi: "Hadir" | "Sakit" | "Izin" | "Alpa"
      status_pembayaran: "Lunas" | "Belum Lunas" | "Cicil"
      status_siswa: "aktif" | "lulus" | "keluar"
      tipe_keuangan: "pemasukan" | "pengeluaran"
      tipe_murid_type: "Siswa Baru" | "Mutasi"
      user_role: "kepala_sekolah" | "bendahara" | "operator" | "guru"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      jenis_kelamin_type: ["Laki-laki", "Perempuan"],
      status_absensi: ["Hadir", "Sakit", "Izin", "Alpa"],
      status_pembayaran: ["Lunas", "Belum Lunas", "Cicil"],
      status_siswa: ["aktif", "lulus", "keluar"],
      tipe_keuangan: ["pemasukan", "pengeluaran"],
      tipe_murid_type: ["Siswa Baru", "Mutasi"],
      user_role: ["kepala_sekolah", "bendahara", "operator", "guru"],
    },
  },
} as const
