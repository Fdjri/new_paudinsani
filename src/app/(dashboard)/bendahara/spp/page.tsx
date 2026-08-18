import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { SppMonthGrid } from '@/components/spp/SppMonthGrid'

export const metadata = {
  title: 'SPP (Bendahara) - PAUD Insani',
}

export default async function SppBendaharaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()
  if (userData?.role !== 'bendahara') redirect('/login')

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Manajemen SPP</h1>
          <p className="text-gray-500 text-sm mt-1">Catat dan kelola pembayaran uang SPP bulanan siswa.</p>
        </div>
      </div>

      <SppMonthGrid basePath="/bendahara/spp" initialYear={currentYear} />
    </div>
  )
}
