import { createClient } from '@/lib/server'
import { SiswaTableClient } from '@/components/siswa/SiswaTableClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Data Siswa (Guru) - PAUD Insani',
}

const ITEMS_PER_PAGE = 10

export default async function DataSiswaGuruPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify Role and get Guru details
  const { data: userData } = await supabase.from('users').select('id, role').eq('auth_id', user.id).single()
  if (userData?.role !== 'guru') redirect('/login')

  // Temukan kelas yang diwali-kelaskan oleh Guru ini
  const { data: guruKelas } = await supabase.from('kelas').select('id, nama_kelas').eq('guru_id', userData.id).single()
  
  const kelasId = guruKelas?.id || null

  // Parse Search Params
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const search = typeof params.q === 'string' ? params.q : ''
  const filterStatus = typeof params.status === 'string' ? params.status : ''

  // 2. Build Query untuk data Siswa
  let query = supabase
    .from('siswas')
    .select(`
      *,
      kelas (id, nama_kelas)
    `, { count: 'exact' })
    .is('deleted_at', null)

  // Memaksa query hanya menampilkan siswa dari kelas si guru
  if (kelasId) {
    query = query.eq('kelas_id', kelasId)
  } else {
    // Jika guru belum punya kelas, tampilkan 0 data
    query = query.eq('id', -1) 
  }

  if (search) {
    query = query.or(`nama_lengkap.ilike.%${search}%,nis.ilike.%${search}%`)
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
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Data Siswa {guruKelas ? `- Kelas ${guruKelas.nama_kelas}` : '(Belum ada kelas)'}
        </h1>
      </div>

      <SiswaTableClient 
        data={siswas || []}
        totalItems={count || 0}
        currentPage={page}
        totalPages={totalPages}
        availableClasses={guruKelas ? [guruKelas] : []} // Guru hanya melihat kelasnya
        role="guru"
      />
    </div>
  )
}
