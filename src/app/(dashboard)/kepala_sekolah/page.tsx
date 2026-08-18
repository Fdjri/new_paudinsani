import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { KeuanganLineChart } from '@/components/charts/KeuanganLineChart'
import { SiswaBarChart } from '@/components/charts/SiswaBarChart'

import { StatCards } from '@/components/dashboard/StatCards'

export const metadata = {
  title: 'Dashboard Kepala Sekolah - PAUD Insani',
}

export default async function KepsekDashboard({
  searchParams
}: {
  searchParams: { year?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()
  if (userData?.role !== 'kepala_sekolah') redirect('/login')

  const currentYear = new Date().getFullYear()
  const params = await searchParams
  const selectedYear = params.year ? parseInt(params.year as string) : currentYear
  const today = new Date().toISOString().split('T')[0]

  // Fetch Stat Cards Data
  const [
    { count: totalSiswa },
    { count: totalGuru },
    { data: summaryDana },
    { data: absensiHariIni }
  ] = await Promise.all([
    supabase.from('siswas').select('id', { count: 'exact', head: true }).eq('status', 'aktif').is('deleted_at', null),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'guru'),
    supabase.rpc('get_keuangan_summary').single(),
    supabase.from('absensis').select('status').eq('tanggal', today)
  ])

  // Hitung persentase kehadiran hari ini
  let persentaseHadir = 0
  if (absensiHariIni && absensiHariIni.length > 0) {
    const hadirCount = absensiHariIni.filter(a => a.status === 'hadir').length
    persentaseHadir = Math.round((hadirCount / absensiHariIni.length) * 100)
  }

  // Fetch Data Keuangan per bulan untuk Line Chart
  const bulanNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const keuanganChartData = await Promise.all(
    bulanNames.map(async (nama, index) => {
      const { data } = await supabase.rpc('get_keuangan_summary', {
        p_tahun: selectedYear,
        p_bulan: index + 1
      }).single()
      
      const sumData = data as any
      return {
        bulan: nama,
        pemasukan: sumData?.total_pemasukan || 0,
        pengeluaran: sumData?.total_pengeluaran || 0
      }
    })
  )

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

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

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka)
  }

  const saldoDana = (summaryDana as any)?.total_dana || 0

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-card-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Selamat datang kembali! Berikut ringkasan operasional PAUD Insani.</p>
      </div>

      <StatCards
        totalSiswa={totalSiswa || 0}
        totalGuru={totalGuru || 0}
        saldoDana={formatRupiah(saldoDana)}
        persentaseHadir={persentaseHadir}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-[24px] border border-border shadow-sm p-2">
          <KeuanganLineChart 
            data={keuanganChartData} 
            years={years} 
            selectedYear={selectedYear} 
            basePath="/kepala_sekolah" 
          />
        </div>
        
        <div className="bg-card rounded-[24px] border border-border shadow-sm p-2">
          <SiswaBarChart 
            data={siswaChartData} 
          />
        </div>
      </div>
    </div>
  )
}
