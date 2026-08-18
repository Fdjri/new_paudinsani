'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/server'

function parseFormData(formData: FormData) {
  return {
    nama: formData.get('nama') as string,
    nik: formData.get('nik') as string,
    username: formData.get('username') as string,
    password: formData.get('password') as string | null,
    foto: formData.get('foto') as string | null,
    tanggal_lahir: formData.get('tanggal_lahir') as string,
    nomor_anggota: formData.get('nomor_anggota') as string || null,
    pendidikan: formData.get('pendidikan') as string || null,
    npwp: formData.get('npwp') as string || null,
    periode: formData.get('periode') as string || null,
    role: formData.get('role') as string,
    kelas_id: formData.get('kelas_id') ? parseInt(formData.get('kelas_id') as string) : null,
  }
}

export async function createGuru(formData: FormData) {
  const supabaseAdmin = createAdminClient()
  const data = parseFormData(formData)

  // 1. Validasi
  if (!data.password) {
    return { error: 'Password wajib diisi untuk pengguna baru.' }
  }
  if (data.nik.length !== 16) {
    return { error: 'NIK harus berjumlah 16 digit.' }
  }

  // 2. Cek duplikasi (Username, NIK, Nomor Anggota) di tabel users
  // Menggunakan admin client untuk bypass RLS (meski sebenarnya select RLS allow authenticated)
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id, username, nik, nomor_anggota')
    .or(`username.eq.${data.username},nik.eq.${data.nik}${data.nomor_anggota ? `,nomor_anggota.eq.${data.nomor_anggota}` : ''}`)
    .maybeSingle()

  if (existingUser) {
    if (existingUser.username === data.username) return { error: 'Username sudah digunakan.' }
    if (existingUser.nik === data.nik) return { error: 'NIK sudah terdaftar.' }
    if (existingUser.nomor_anggota === data.nomor_anggota) return { error: 'Nomor Anggota sudah terdaftar.' }
  }

  // 3. Buat akun di Supabase Auth (auth.users)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: `${data.username}@paudinsani.local`, // Fake email for auth since they login with username/password logic if we use custom, but Supabase requires email for default. We can use email in login if username isn't supported out-of-the-box, or we login with email mapped from username.
    password: data.password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    console.error('Auth Create error:', authError)
    return { error: 'Gagal membuat akun autentikasi: ' + authError?.message }
  }

  const authId = authData.user.id

  // 4. Insert data profil ke public.users
  const { data: newUser, error: insertError } = await supabaseAdmin
    .from('users')
    .insert({
      auth_id: authId,
      nama: data.nama,
      nik: data.nik,
      username: data.username,
      foto: data.foto,
      tanggal_lahir: data.tanggal_lahir,
      nomor_anggota: data.nomor_anggota,
      pendidikan: data.pendidikan,
      npwp: data.npwp,
      periode: data.periode,
      role: data.role as any,
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('Insert User error:', insertError)
    // Rollback auth
    await supabaseAdmin.auth.admin.deleteUser(authId)
    return { error: 'Gagal membuat profil: ' + insertError.message }
  }

  // 5. Update Wali Kelas jika ada
  if (data.kelas_id && newUser) {
    const { error: kelasError } = await supabaseAdmin
      .from('kelas')
      .update({ guru_id: newUser.id })
      .eq('id', data.kelas_id)
      
    if (kelasError) {
      console.error('Gagal assign wali kelas:', kelasError)
    }
  }

  revalidatePath('/(dashboard)/kepala_sekolah/guru', 'page')
  revalidatePath('/(dashboard)/operator/guru', 'page')

  return { success: true }
}

export async function updateGuru(userId: string, authId: string, formData: FormData) {
  const supabaseAdmin = createAdminClient()
  const data = parseFormData(formData)

  // 1. Validasi
  if (data.nik.length !== 16) {
    return { error: 'NIK harus berjumlah 16 digit.' }
  }

  // 2. Cek duplikasi kecuali diri sendiri
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id, username, nik, nomor_anggota')
    .neq('id', userId)
    .or(`username.eq.${data.username},nik.eq.${data.nik}${data.nomor_anggota ? `,nomor_anggota.eq.${data.nomor_anggota}` : ''}`)
    .maybeSingle()

  if (existingUser) {
    if (existingUser.username === data.username) return { error: 'Username sudah digunakan oleh orang lain.' }
    if (existingUser.nik === data.nik) return { error: 'NIK sudah terdaftar oleh orang lain.' }
    if (existingUser.nomor_anggota === data.nomor_anggota) return { error: 'Nomor Anggota sudah terdaftar oleh orang lain.' }
  }

  // 3. Update Auth jika Password diganti
  if (data.password) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(authId, {
      password: data.password,
    })
    if (authError) {
      return { error: 'Gagal memperbarui kata sandi: ' + authError.message }
    }
  }

  // Jika Username diganti, kita perlu update email Auth
  const { data: currentUser } = await supabaseAdmin.from('users').select('username').eq('id', userId).single()
  if (currentUser && currentUser.username !== data.username) {
    await supabaseAdmin.auth.admin.updateUserById(authId, {
      email: `${data.username}@paudinsani.local`,
    })
  }

  // 4. Update tabel users
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      nama: data.nama,
      nik: data.nik,
      username: data.username,
      foto: data.foto,
      tanggal_lahir: data.tanggal_lahir,
      nomor_anggota: data.nomor_anggota,
      pendidikan: data.pendidikan,
      npwp: data.npwp,
      periode: data.periode,
      role: data.role as any,
    })
    .eq('id', userId)

  if (updateError) {
    return { error: 'Gagal memperbarui profil: ' + updateError.message }
  }

  // 5. Update Wali Kelas
  // Set null untuk kelas yang sebelumnya diampu oleh guru ini
  await supabaseAdmin
    .from('kelas')
    .update({ guru_id: null })
    .eq('guru_id', userId)

  // Set kelas_id baru jika ada
  if (data.kelas_id) {
    await supabaseAdmin
      .from('kelas')
      .update({ guru_id: userId })
      .eq('id', data.kelas_id)
  }

  revalidatePath('/(dashboard)/kepala_sekolah/guru', 'page')
  revalidatePath('/(dashboard)/operator/guru', 'page')

  return { success: true }
}

export async function deleteGuru(authId: string) {
  const supabaseAdmin = createAdminClient()

  // Menghapus auth.users akan otomatis menghapus dari public.users karena ON DELETE CASCADE
  // Serta akan SET NULL pada kelas dan pembayarans
  const { error } = await supabaseAdmin.auth.admin.deleteUser(authId)

  if (error) {
    console.error('Delete User error:', error)
    return { error: 'Gagal menghapus pengguna: ' + error.message }
  }

  revalidatePath('/(dashboard)/kepala_sekolah/guru', 'page')
  revalidatePath('/(dashboard)/operator/guru', 'page')

  return { success: true }
}
