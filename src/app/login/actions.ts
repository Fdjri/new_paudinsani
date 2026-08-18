'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  let email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Username/Email dan password harus diisi' }
  }

  // Jika input bukan email, asumsikan itu adalah username
  if (!email.includes('@')) {
    email = `${email}@paudinsani.sch.id`
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { error: 'Login gagal. Periksa kembali kredensial Anda.' }
  }

  // Ambil role dari tabel users untuk menentukan halaman redirect
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', authData.user.id)
    .single()

  if (userError || !userData) {
    // Fallback jika tidak ada data di tabel users
    revalidatePath('/')
    return { success: true, redirectTo: '/dashboard' }
  }

  revalidatePath('/')
  // Redirect sesuai role
  return { success: true, redirectTo: `/${userData.role}` }
}
