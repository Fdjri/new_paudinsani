import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { Users, BookOpen, UserCheck, ChartLineUp } from '@phosphor-icons/react'
import { AbsensiDonutChart } from '@/components/charts/AbsensiDonutChart'

export const metadata = {
  title: 'Dashboard Guru - PAUD Insani',
}

export default async function GuruDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role, id').eq('auth_id', user.id).single()
  if (userData?.role !== 'guru') redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  // 1. Fetch Guru's Class
  const { data: guruData } = await supabase.from('users').select('id, nama').eq('id', userData.id).single()
  
  const { data: kelas } = await supabase.from('kelas').select('id, nama_kelas').eq('guru_id', userData.id).maybeSingle()
  const kelasId = kelas?.id

  let namaKelas = '-'
  let totalSiswaAktif = 0
  let absensiData: any[] = []
  
  if (kelasId && kelas) {
    namaKelas = kelas.nama_kelas
    
    const { count } = await supabase.from('siswas').select('id', { count: 'exact', head: true }).eq('kelas_id', kelasId).eq('status', 'aktif').is('deleted_at', null)
    totalSiswaAktif = count || 0
    
    // 2. Fetch Absensi Hari Ini for this class
    // We join absensis with siswas to only count students in this guru's class
    const { data: absensiHariIni } = await supabase
      .from('absensis')
      .select('status, siswas!inner(kelas_id)')
      .eq('tanggal', today)
      .eq('siswas.kelas_id', kelasId)
      
    if (absensiHariIni) {
      absensiData = absensiHariIni
    }
  }

  // Hitung persentase kehadiran hari ini
  let persentaseHadir = 0
  
  let countHadir = 0
  let countSakit = 0
  let countIzin = 0
  let countAlpa = 0

  if (absensiData && absensiData.length > 0) {
    countHadir = absensiData.filter(a => a.status === 'hadir').length
    countSakit = absensiData.filter(a => a.status === 'sakit').length
    countIzin = absensiData.filter(a => a.status === 'izin').length
    countAlpa = absensiData.filter(a => a.status === 'alpa').length
    
    persentaseHadir = Math.round((countHadir / absensiData.length) * 100)
  }

  const chartData = [
    { name: 'Hadir', value: countHadir },
    { name: 'Sakit', value: countSakit },
    { name: 'Izin', value: countIzin },
    { name: 'Alpa', value: countAlpa },
  ]
  
  // Kalau kosong, berikan chart default agar visual tetap muncul tapi 0
  const isDataEmpty = chartData.every(d => d.value === 0)
  const renderData = isDataEmpty ? [] : chartData

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Selamat datang, {guruData?.nama || 'Guru'}!</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan aktivitas Kelas {namaKelas}.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><BookOpen weight="duotone" className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Kelas Anda</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{namaKelas}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 ring-1 ring-blue-500">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users weight="duotone" className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Total Siswa (Aktif)</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{totalSiswaAktif}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><UserCheck weight="duotone" className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Hadir Hari Ini</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{countHadir}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><ChartLineUp weight="duotone" className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Persentase Kehadiran</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{persentaseHadir}%</h3>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AbsensiDonutChart data={renderData} />
      </div>
    </div>
  )
}
