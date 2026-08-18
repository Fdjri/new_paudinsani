'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/server'

/**
 * Helper untuk parsing dan mapping data form Siswa ke format database.
 */
function parseFormData(formData: FormData) {
  return {
    foto: formData.get('foto') as string | null,
    nis: formData.get('nis') as string,
    nik: formData.get('nik') as string || null,
    no_kk: formData.get('no_kk') as string || null,
    nama_lengkap: formData.get('nama_lengkap') as string,
    nama_panggilan: formData.get('nama_panggilan') as string || null,
    jenis_kelamin: formData.get('jenis_kelamin') as string,
    tanggal_lahir: formData.get('tanggal_lahir') as string,
    agama: formData.get('agama') as string || null,
    kewarganegaraan: formData.get('kewarganegaraan') as string || 'Indonesia',
    anak_ke: formData.get('anak_ke') ? parseInt(formData.get('anak_ke') as string) : null,
    jumlah_saudara_kandung: formData.get('jumlah_saudara_kandung') ? parseInt(formData.get('jumlah_saudara_kandung') as string) : null,
    bahasa_sehari_hari: formData.get('bahasa_sehari_hari') as string || null,
    berat_badan: formData.get('berat_badan') ? parseFloat(formData.get('berat_badan') as string) : null,
    tinggi_badan: formData.get('tinggi_badan') ? parseFloat(formData.get('tinggi_badan') as string) : null,
    golongan_darah: formData.get('golongan_darah') as string || null,
    penyakit_yang_pernah_diderita: formData.get('penyakit_yang_pernah_diderita') as string || null,
    alamat_tempat_tinggal: formData.get('alamat_tempat_tinggal') as string,
    nomor_telp: formData.get('nomor_telp') as string || null,
    jarak_tempat_tinggal_ke_sekolah: formData.get('jarak_tempat_tinggal_ke_sekolah') as string || null,

    // Data Ayah
    nama_ayah_kandung: formData.get('nama_ayah_kandung') as string || null,
    pendidikan_ayah: formData.get('pendidikan_ayah') as string || null,
    pekerjaan_ayah: formData.get('pekerjaan_ayah') as string || null,

    // Data Ibu
    nama_ibu_kandung: formData.get('nama_ibu_kandung') as string || null,
    pendidikan_ibu: formData.get('pendidikan_ibu') as string || null,
    pekerjaan_ibu: formData.get('pekerjaan_ibu') as string || null,

    // Data Wali
    nama_wali: formData.get('nama_wali') as string || null,
    pendidikan_wali: formData.get('pendidikan_wali') as string || null,
    pekerjaan_wali: formData.get('pekerjaan_wali') as string || null,
    hubungan_wali: formData.get('hubungan_wali') as string || null,

    // Status
    tipe_murid: formData.get('tipe_murid') as string || 'Siswa Baru',
    status: formData.get('status') as string || 'aktif',
    tahun_masuk: formData.get('tahun_masuk') ? parseInt(formData.get('tahun_masuk') as string) : new Date().getFullYear(),
    kelas_id: formData.get('kelas_id') ? parseInt(formData.get('kelas_id') as string) : null,
  }
}

export async function createSiswa(formData: FormData) {
  const supabase = await createClient()
  const data = parseFormData(formData)

  // Cek validasi NIS unik
  const { data: existingNis } = await supabase
    .from('siswas')
    .select('id')
    .eq('nis', data.nis)
    .single()

  if (existingNis) {
    return { error: 'NIS sudah terdaftar.' }
  }

  // Cek NIK unik
  if (data.nik) {
    const { data: existingNik } = await supabase
      .from('siswas')
      .select('id')
      .eq('nik', data.nik)
      .single()

    if (existingNik) {
      return { error: 'NIK sudah terdaftar.' }
    }
  }

  const { error } = await supabase.from('siswas').insert(data as any)

  if (error) {
    console.error('Insert Siswa error:', error)
    return { error: error.message }
  }

  // Revalidate routes
  revalidatePath('/(dashboard)/kepala_sekolah/siswa', 'page')
  revalidatePath('/(dashboard)/operator/siswa', 'page')

  return { success: true }
}

export async function updateSiswa(id: number, formData: FormData) {
  const supabase = await createClient()
  const data = parseFormData(formData)

  // Cek validasi NIS unik selain dirinya sendiri
  const { data: existingNis } = await supabase
    .from('siswas')
    .select('id')
    .eq('nis', data.nis)
    .neq('id', id)
    .maybeSingle()

  if (existingNis) {
    return { error: 'NIS sudah terdaftar oleh siswa lain.' }
  }

  // Cek NIK unik
  if (data.nik) {
    const { data: existingNik } = await supabase
      .from('siswas')
      .select('id')
      .eq('nik', data.nik)
      .neq('id', id)
      .maybeSingle()

    if (existingNik) {
      return { error: 'NIK sudah terdaftar oleh siswa lain.' }
    }
  }

  const { error } = await supabase.from('siswas').update(data as any).eq('id', id)

  if (error) {
    console.error('Update Siswa error:', error)
    return { error: error.message }
  }

  revalidatePath('/(dashboard)/kepala_sekolah/siswa', 'page')
  revalidatePath('/(dashboard)/operator/siswa', 'page')

  return { success: true }
}

export async function deleteSiswa(id: number) {
  const supabase = await createClient()

  // Soft Delete: Update deleted_at timestamp
  const { error } = await supabase
    .from('siswas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Delete Siswa error:', error)
    return { error: error.message }
  }

  revalidatePath('/(dashboard)/kepala_sekolah/siswa', 'page')
  revalidatePath('/(dashboard)/operator/siswa', 'page')

  return { success: true }
}
