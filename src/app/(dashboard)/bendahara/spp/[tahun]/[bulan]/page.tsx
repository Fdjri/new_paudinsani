import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { SppFormClient } from '@/components/spp/SppFormClient'

export const metadata = {
  title: 'Detail SPP - PAUD Insani',
}

export default async function DetailSppBendaharaPage({ params }: { params: Promise<{ tahun: string, bulan: string }> }) {
  const resolvedParams = await params
  const tahun = parseInt(resolvedParams.tahun)
  const bulan = parseInt(resolvedParams.bulan)
  
  if (isNaN(tahun) || isNaN(bulan) || bulan < 1 || bulan > 12) {
    redirect('/bendahara/spp')
  }

  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()
  if (userData?.role !== 'bendahara') redirect('/login')

  // 2. Get settings for spp_nominal
  const { data: settingData } = await supabase.from('settings').select('value').eq('key', 'spp_nominal').single()
  let sppNominal = 0
  if (settingData) {
    const val = settingData.value
    if (typeof val === 'string') sppNominal = parseInt(val.replace(/[^0-9]/g, ''))
    else if (typeof val === 'number') sppNominal = val
  }

  // 3. Fetch Data Siswa Aktif
  const { data: siswas, error: siswaError } = await supabase
    .from('siswas')
    .select(`
      id, nis, nama_lengkap, foto,
      kelas (nama_kelas)
    `)
    .eq('status', 'aktif')
    .is('deleted_at', null)
    .order('nama_lengkap', { ascending: true })

  if (siswaError) {
    console.error('Error fetching siswas:', siswaError)
  }

  // 4. Fetch Data Pembayaran SPP pada tahun dan bulan tersebut
  const { data: pembayarans, error: sppError } = await supabase
    .from('pembayarans')
    .select(`
      siswa_id, status, jumlah_bayar, keterangan,
      pencatat:users!pembayarans_user_id_fkey(nama)
    `)
    .eq('tahun_ajaran', tahun)
    .eq('bulan_pembayaran', bulan)
    .eq('jenis_pembayaran', 'SPP')

  if (sppError) {
    console.error('Error fetching pembayarans:', sppError)
  }

  // 5. Merge Data
  const sppMap = new Map()
  pembayarans?.forEach(p => {
    sppMap.set(p.siswa_id, p)
  })

  const mergedData = (siswas || []).map(s => ({
    ...s,
    kelas: s.kelas as any,
    pembayaran: (sppMap.get(s.id) as any) || null
  }))

  return (
    <SppFormClient 
      tahunAjaran={tahun}
      bulan={bulan}
      nominalSpp={sppNominal}
      students={mergedData}
      backPath="/bendahara/spp"
    />
  )
}
