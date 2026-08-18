import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { Wallet, TrendUp as TrendingUp, TrendDown as TrendingDown } from '@phosphor-icons/react'
import { KeuanganLineChart } from '@/components/charts/KeuanganLineChart'

export const metadata = {
  title: 'Dashboard Bendahara - PAUD Insani',
}

export default async function BendaharaDashboard({
  searchParams
}: {
  searchParams: { year?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()
  if (userData?.role !== 'bendahara') redirect('/login')

  const currentYear = new Date().getFullYear()
  const params = await searchParams
  const selectedYear = params.year ? parseInt(params.year as string) : currentYear

  // Fetch Summary Dana for this year
  const { data: summaryDana } = await supabase.rpc('get_keuangan_summary', {
    p_tahun: selectedYear
  }).single()

  const s = summaryDana as any
  const totalPemasukan = s?.total_pemasukan || 0
  const totalPengeluaran = s?.total_pengeluaran || 0
  const saldoDana = s?.total_dana || 0

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

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka)
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Dashboard Bendahara</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan aktivitas keuangan tahun {selectedYear}.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><TrendingUp weight="duotone" className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Pemasukan</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{formatRupiah(totalPemasukan)}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl"><TrendingDown weight="duotone" className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Pengeluaran</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{formatRupiah(totalPengeluaran)}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 ring-1 ring-blue-500">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Wallet weight="duotone" className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Saldo Dana Tersedia</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{formatRupiah(saldoDana)}</h3>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <KeuanganLineChart 
          data={keuanganChartData} 
          years={years} 
          selectedYear={selectedYear} 
          basePath="/bendahara" 
        />
      </div>
    </div>
  )
}
