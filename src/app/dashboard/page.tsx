import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export default async function DashboardRedirect() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Ambil role dari tabel users
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (userError || !userData) {
    // Jika data user belum terbuat (misal karena auth.users ada tapi trigger telat atau belum seed)
    // Tampilkan pesan error sederhana daripada looping
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center p-4">
        <div>
          <h1 className="text-xl font-bold text-red-600 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-4">Profil pengguna belum diatur oleh admin.</p>
          <form action="/auth/logout" method="post">
            <button type="submit" className="text-blue-600 underline">Logout</button>
          </form>
        </div>
      </div>
    )
  }

  // Redirect sesuai role
  redirect(`/${userData.role}`)
}
