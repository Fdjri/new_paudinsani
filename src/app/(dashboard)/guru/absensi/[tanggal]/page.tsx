import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { AbsensiFormClient } from '@/components/absensi/AbsensiFormClient'
import { getIndonesianHolidays } from '@/lib/holidays'

export const metadata = {
  title: 'Isi Absensi - PAUD Insani',
}

export default async function IsiAbsensiGuruPage({ params }: { params: Promise<{ tanggal: string }> }) {
  const { tanggal } = await params // Format YYYY-MM-DD
  
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('id, role').eq('auth_id', user.id).single()
  if (userData?.role !== 'guru') redirect('/login')

  // Cari tahu kelas yang diampu
  const { data: guruKelas } = await supabase.from('kelas').select('id').eq('guru_id', userData.id).single()
  
  if (!guruKelas) {
    redirect('/guru/absensi') // Redirect jika bukan wali kelas
  }

  // 2. Fetch Holiday info
  const year = parseInt(tanggal.split('-')[0])
  const holidays = await getIndonesianHolidays(year)
  const holiday = holidays.find(h => h.date === tanggal)

  // 3. Fetch Data Siswa Aktif (Hanya kelas guru tersebut)
  const { data: siswas, error: siswaError } = await supabase
    .from('siswas')
    .select(`
      id, nis, nama_lengkap, foto,
      kelas (nama_kelas)
    `)
    .eq('status', 'aktif')
    .eq('kelas_id', guruKelas.id) // Scope per kelas
    .is('deleted_at', null)
    .order('nama_lengkap', { ascending: true })

  if (siswaError) {
    console.error('Error fetching siswas:', siswaError)
  }

  // 4. Fetch Data Absensi pada tanggal tersebut (Hanya siswa kelas ini)
  const siswaIds = siswas?.map(s => s.id) || []
  let absensis: any[] = []
  
  if (siswaIds.length > 0) {
    const { data: abs, error: absensiError } = await supabase
      .from('absensis')
      .select('siswa_id, status, keterangan')
      .eq('tanggal_absensi', tanggal)
      .in('siswa_id', siswaIds)

    if (absensiError) {
      console.error('Error fetching absensis:', absensiError)
    } else {
      absensis = abs || []
    }
  }

  // 5. Merge Data
  const absensiMap = new Map()
  absensis.forEach(a => {
    absensiMap.set(a.siswa_id, a)
  })

  const mergedData = (siswas || []).map(s => ({
    ...s,
    kelas: s.kelas as any, // Bypass TS array inference for foreign key
    absensi: absensiMap.get(s.id) || null
  }))

  return (
    <AbsensiFormClient 
      date={tanggal}
      students={mergedData}
      holiday={holiday}
      backPath="/guru/absensi"
    />
  )
}
