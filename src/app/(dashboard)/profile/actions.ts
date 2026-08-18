'use server'

import { createClient, createAdminClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Dapatkan user yang sedang login
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Anda belum login atau sesi telah berakhir.' }
  }

  // 2. Ambil data saat ini
  const { data: currentUser } = await supabase
    .from('users')
    .select('id, role, foto, nik, nomor_anggota')
    .eq('auth_id', user.id)
    .single()

  if (!currentUser) return { error: 'Data profil tidak ditemukan.' }

  // 3. Ekstrak form data
  const nama = formData.get('nama') as string
  const nik = formData.get('nik') as string
  const tanggal_lahir = formData.get('tanggal_lahir') as string
  const pendidikan = formData.get('pendidikan') as string || null
  const npwp = formData.get('npwp') as string || null
  const nomor_anggota = formData.get('nomor_anggota') as string || null
  const periode = formData.get('periode') as string || null
  const fotoPath = formData.get('foto') as string || null

  // 4. Validasi NIK
  if (nik && nik.length !== 16) {
    return { error: 'NIK harus berjumlah 16 digit.' }
  }

  // 5. Cek duplikasi NIK & Nomor Anggota
  const supabaseAdmin = createAdminClient()
  const conditions = [`nik.eq.${nik}`]
  if (nomor_anggota) conditions.push(`nomor_anggota.eq.${nomor_anggota}`)

  const { data: duplicateUser } = await supabaseAdmin
    .from('users')
    .select('id, nik, nomor_anggota')
    .neq('id', currentUser.id)
    .or(conditions.join(','))
    .maybeSingle()

  if (duplicateUser) {
    if (duplicateUser.nik === nik) return { error: 'NIK sudah digunakan oleh pengguna lain.' }
    if (nomor_anggota && duplicateUser.nomor_anggota === nomor_anggota) return { error: 'Nomor Anggota sudah digunakan oleh pengguna lain.' }
  }

  // 6. Hapus foto lama jika diganti (dan jika foto lama tidak null)
  if (fotoPath && currentUser.foto && fotoPath !== currentUser.foto) {
    const oldPath = currentUser.foto.split('avatars/').pop()
    if (oldPath) {
      await supabaseAdmin.storage.from('avatars').remove([oldPath])
    }
  }

  // 7. Update profil
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      nama,
      nik,
      tanggal_lahir,
      pendidikan,
      npwp,
      nomor_anggota,
      periode,
      foto: fotoPath || currentUser.foto, // Kalau dikosongkan formnya, tetap pakai yang lama (kecuali ada fitur delete foto)
    })
    .eq('id', currentUser.id)

  if (updateError) {
    return { error: 'Terjadi kesalahan saat menyimpan profil: ' + updateError.message }
  }

  // Revalidate routes
  revalidatePath(`/(dashboard)/${currentUser.role}/profile`, 'page')
  revalidatePath(`/(dashboard)/${currentUser.role}`, 'layout')

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Anda belum login.' }

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!password || password.length < 6) {
    return { error: 'Kata sandi minimal 6 karakter.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Konfirmasi kata sandi tidak cocok.' }
  }

  // Update password via Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: 'Gagal memperbarui kata sandi: ' + error.message }
  }

  return { success: true }
}
