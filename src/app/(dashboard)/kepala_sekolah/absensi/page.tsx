import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { Calendar } from '@/components/absensi/Calendar'
import { getIndonesianHolidays } from '@/lib/holidays'

export const metadata = {
  title: 'Kalender Absensi (Kepsek) - PAUD Insani',
}

export default async function AbsensiKepsekPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()
  if (userData?.role !== 'kepala_sekolah') redirect('/login')

  const currentYear = new Date().getFullYear()
  const holidays = await getIndonesianHolidays(currentYear)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Kalender Absensi</h1>
          <p className="text-gray-500 text-sm mt-1">Pilih tanggal efektif untuk melihat atau mengisi absensi seluruh siswa.</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <Calendar basePath="/kepala_sekolah/absensi" holidays={holidays} />
      </div>
    </div>
  )
}
