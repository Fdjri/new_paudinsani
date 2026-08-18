import { createClient } from '@/lib/server'
import { SiswaTableClient } from '@/components/siswa/SiswaTableClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Data Siswa - PAUD Insani',
}

const ITEMS_PER_PAGE = 10

export default async function DataSiswaPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify Role
  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()
  if (userData?.role !== 'kepala_sekolah') redirect('/login')

  // Parse Search Params
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const search = typeof params.q === 'string' ? params.q : ''
  const filterKelas = typeof params.kelas === 'string' ? params.kelas : ''
  const filterStatus = typeof params.status === 'string' ? params.status : ''

  // 1. Ambil list kelas untuk filter dropdown
  const { data: kelasList } = await supabase.from('kelas').select('id, nama_kelas').order('nama_kelas')

  // 2. Build Query untuk data Siswa
  let query = supabase
    .from('siswas')
    .select(`
      *,
      kelas (id, nama_kelas)
    `, { count: 'exact' })
    .is('deleted_at', null)

  if (search) {
    query = query.or(`nama_lengkap.ilike.%${search}%,nis.ilike.%${search}%`)
  }

  if (filterKelas) {
    query = query.eq('kelas_id', filterKelas)
  }

  if (filterStatus) {
    query = query.eq('status', filterStatus)
  }

  // 3. Eksekusi Query
  const { data: siswas, count, error } = await query
    .order('nama_lengkap', { ascending: true })
    .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

  if (error) {
    console.error('Error fetching siswas:', error)
  }

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Manajemen Data Siswa</h1>
      </div>

      <SiswaTableClient 
        data={siswas || []}
        totalItems={count || 0}
        currentPage={page}
        totalPages={totalPages}
        availableClasses={kelasList || []}
        role="kepala_sekolah"
      />
    </div>
  )
}
