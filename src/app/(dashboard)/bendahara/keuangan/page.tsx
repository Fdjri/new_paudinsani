import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { KeuanganClient } from '@/components/keuangan/KeuanganClient'

export const metadata = {
  title: 'Keuangan (Bendahara) - PAUD Insani',
}

export default async function KeuanganBendaharaPage({
  searchParams
}: {
  searchParams: { search?: string, bulan?: string, tahun?: string, tipe?: string }
}) {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()
  if (userData?.role !== 'bendahara') redirect('/login')

  // 2. Parsed Filters
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : ''
  const bulan = typeof params.bulan === 'string' ? params.bulan : ''
  const tahun = typeof params.tahun === 'string' ? params.tahun : ''
  const tipe = typeof params.tipe === 'string' ? params.tipe : ''

  // 3. Get Summary via RPC
  let rpcArgs: any = {}
  if (tahun) rpcArgs.p_tahun = parseInt(tahun)
  if (bulan) rpcArgs.p_bulan = parseInt(bulan)

  const { data: summaryData, error: summaryError } = await supabase
    .rpc('get_keuangan_summary', rpcArgs)
    .single()

  if (summaryError) console.error('Error fetching summary:', summaryError)

  const summaryDataAny = summaryData as any
  const summary = {
    total_pemasukan: summaryDataAny?.total_pemasukan || 0,
    total_pengeluaran: summaryDataAny?.total_pengeluaran || 0,
    total_dana: summaryDataAny?.total_dana || 0,
  }

  // 4. Get Transactions with Filters
  let query = supabase.from('keuangans').select('*').order('tanggal', { ascending: false }).order('id', { ascending: false })

  if (search) query = query.ilike('deskripsi', `%${search}%`)
  if (tipe) query = query.eq('tipe', tipe)
  
  if (tahun || bulan) {
    if (tahun && !bulan) {
      query = query.gte('tanggal', `${tahun}-01-01`).lte('tanggal', `${tahun}-12-31`)
    } else if (tahun && bulan) {
      const b = bulan.padStart(2, '0')
      const lastDay = new Date(parseInt(tahun), parseInt(bulan), 0).getDate()
      query = query.gte('tanggal', `${tahun}-${b}-01`).lte('tanggal', `${tahun}-${b}-${lastDay}`)
    }
  }

  const { data: keuangans, error: keuangansError } = await query

  if (keuangansError) console.error('Error fetching transactions:', keuangansError)

  let filteredData = keuangans || []
  if (!tahun && bulan) {
    filteredData = filteredData.filter(k => new Date(k.tanggal).getMonth() + 1 === parseInt(bulan))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Keuangan & Kas</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola pencatatan aliran dana pemasukan dan pengeluaran sekolah.</p>
        </div>
      </div>

      <KeuanganClient 
        data={filteredData}
        summary={summary}
        filters={{ search, bulan, tahun, tipe }}
        basePath="/bendahara/keuangan"
      />
    </div>
  )
}
