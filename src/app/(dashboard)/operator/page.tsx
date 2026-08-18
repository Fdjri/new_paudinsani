import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { Users, UserCheck, GraduationCap } from '@phosphor-icons/react'
import { SiswaBarChart } from '@/components/charts/SiswaBarChart'

export const metadata = {
  title: 'Dashboard Operator - PAUD Insani',
}

export default async function OperatorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()
  if (userData?.role !== 'operator') redirect('/login')

  // Fetch Stat Cards Data
  const [
    { count: totalSiswa },
    { count: totalSiswaAktif },
    { count: totalGuruAktif },
    { count: totalKelas }
  ] = await Promise.all([
    supabase.from('siswas').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('siswas').select('id', { count: 'exact', head: true }).eq('status', 'aktif').is('deleted_at', null),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'guru'),
    supabase.from('kelas').select('id', { count: 'exact', head: true })
  ])

  // Fetch Data Siswa per Kelas untuk Bar Chart
  const { data: kelasData } = await supabase.from('kelas').select('id, nama_kelas')
  const { data: siswaData } = await supabase.from('siswas').select('kelas_id, status').is('deleted_at', null)
  
  const siswaChartData = (kelasData || []).map(k => {
    const siswasInClass = (siswaData || []).filter(s => s.kelas_id === k.id)
    return {
      kelas: `Kelas ${k.nama_kelas}`,
      aktif: siswasInClass.filter(s => s.status === 'aktif').length,
      total: siswasInClass.length
    }
  })

  // Sort by class name
  siswaChartData.sort((a, b) => a.kelas.localeCompare(b.kelas))

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Dashboard Operator</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan data master (Siswa, Guru, dan Kelas).</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users weight="duotone" className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Terdaftar</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{totalSiswa || 0}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 ring-1 ring-blue-500">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><UserCheck weight="duotone" className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Siswa Aktif</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{totalSiswaAktif || 0}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><UserCheck weight="duotone" className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Guru Aktif</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{totalGuruAktif || 0}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><GraduationCap weight="duotone" className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Rombel / Kelas</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{totalKelas || 0}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div>
        <SiswaBarChart 
          data={siswaChartData} 
        />
      </div>
    </div>
  )
}
