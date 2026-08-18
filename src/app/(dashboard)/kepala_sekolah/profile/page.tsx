import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from '@/components/profile/ProfileClient'

export const metadata = {
  title: 'Profil - PAUD Insani',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  if (!userData || userData.role !== 'kepala_sekolah') redirect('/login')

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Profil Saya</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      <ProfileClient user={userData} />
    </div>
  )
}
