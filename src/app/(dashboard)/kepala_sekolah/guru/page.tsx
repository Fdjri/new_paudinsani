import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { GuruTableClient } from '@/components/guru/GuruTableClient'

export const metadata = {
  title: 'Manajemen Pegawai - PAUD Insani',
}

const ITEMS_PER_PAGE = 6

export default async function DataGuruKepsekPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()
  if (userData?.role !== 'kepala_sekolah') redirect('/login')

  // 2. Fetch available classes for Wali Kelas assignment
  const { data: availableClasses } = await supabase
    .from('kelas')
    .select('id, nama_kelas, guru_id')
    .order('nama_kelas', { ascending: true })

  // 3. Parse Search Params
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const search = typeof params.q === 'string' ? params.q.toLowerCase() : ''

  // 4. Fetch Users (We fetch all matching users to sort by custom role priority in memory)
  // Sebenarnya PAUD memiliki jumlah guru yang sedikit (< 50), jadi fetch all + sort in memory sangat aman dan cepat.
  let query = supabase
    .from('users')
    .select(`
      *,
      kelas (id, nama_kelas)
    `)

  if (search) {
    query = query.or(`nama.ilike.%${search}%,nik.ilike.%${search}%`)
  }

  const { data: allUsers, error } = await query

  if (error) {
    console.error('Error fetching users:', error)
  }

  // 5. Sort by Role Priority
  const rolePriority: Record<string, number> = {
    kepala_sekolah: 1,
    bendahara: 2,
    operator: 3,
    guru: 4,
  }

  const sortedUsers = (allUsers || []).sort((a, b) => {
    const pA = rolePriority[a.role] || 99
    const pB = rolePriority[b.role] || 99
    if (pA !== pB) return pA - pB
    return a.nama.localeCompare(b.nama) // secondary sort by name
  })

  // 6. Paginate in memory
  const totalItems = sortedUsers.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1
  
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Manajemen Pegawai</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data guru, operator, bendahara, dan kepala sekolah.</p>
        </div>
      </div>

      <GuruTableClient 
        data={paginatedUsers}
        totalItems={totalItems}
        currentPage={page}
        totalPages={totalPages}
        availableClasses={availableClasses || []}
      />
    </div>
  )
}
