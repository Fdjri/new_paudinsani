import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { Calendar } from '@/components/absensi/Calendar'
import { getIndonesianHolidays } from '@/lib/holidays'
import { Badge } from '@/components/ui/Badge'

export const metadata = {
  title: 'Kalender Absensi (Guru) - PAUD Insani',
}

export default async function AbsensiGuruPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('id, role').eq('auth_id', user.id).single()
  if (userData?.role !== 'guru') redirect('/login')

  // Cari tahu kelas yang diampu
  const { data: guruKelas } = await supabase.from('kelas').select('nama_kelas').eq('guru_id', userData.id).single()

  const currentYear = new Date().getFullYear()
  const holidays = await getIndonesianHolidays(currentYear)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900 flex items-center gap-3">
            Kalender Absensi
            {guruKelas && <Badge variant="info">Kelas {guruKelas.nama_kelas}</Badge>}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Pilih tanggal efektif untuk melihat atau mengisi absensi kelas Anda.</p>
        </div>
      </div>

      {!guruKelas ? (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 max-w-4xl">
          <strong>Peringatan:</strong> Anda belum ditugaskan sebagai Wali Kelas. Anda tidak dapat mengisi absensi sebelum ditugaskan oleh Kepala Sekolah.
        </div>
      ) : (
        <div className="max-w-4xl">
          <Calendar basePath="/guru/absensi" holidays={holidays} />
        </div>
      )}
    </div>
  )
}
