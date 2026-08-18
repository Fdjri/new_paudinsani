'use client'

import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, MagnifyingGlass, User, PencilSimple, Trash, Eye } from '@phosphor-icons/react'
import { SiswaFormModal } from './SiswaFormModal'
import { SiswaDetailModal } from './SiswaDetailModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteSiswa } from '@/app/(dashboard)/siswa/actions'
import { useToast } from '@/components/ui/Toast'

interface SiswaTableClientProps {
  data: any[]
  totalItems: number
  currentPage: number
  totalPages: number
  availableClasses: { id: number; nama_kelas: string }[]
  role: 'kepala_sekolah' | 'operator' | 'bendahara' | 'guru'
}

export function SiswaTableClient({
  data,
  totalItems,
  currentPage,
  totalPages,
  availableClasses,
  role,
}: SiswaTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const isReadOnly = role === 'guru' || role === 'bendahara'

  // Modal States
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  
  const [selectedData, setSelectedData] = React.useState<any | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Search & Filter State (Local, to sync with URL)
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('q') || '')

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get('q') || '')) {
        updateUrlParams('q', searchTerm)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, searchParams])
  
  // Updates URL with new search params
  const updateUrlParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to page 1 on filter change
    if (key !== 'page') params.set('page', '1')
    
    router.push(`${pathname}?${params.toString()}`)
  }

  // Handlers for Modals
  const handleAdd = () => {
    setSelectedData(null)
    setIsFormOpen(true)
  }

  const handleEdit = (siswa: any) => {
    setSelectedData(siswa)
    setIsFormOpen(true)
  }

  const handleDetail = (siswa: any) => {
    setSelectedData(siswa)
    setIsDetailOpen(true)
  }

  const handleDeletePrompt = (siswa: any) => {
    setSelectedData(siswa)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedData) return
    setIsDeleting(true)
    const res = await deleteSiswa(selectedData.id)
    setIsDeleting(false)
    setIsDeleteOpen(false)
    
    if (res.error) {
      toast(res.error, 'error')
    } else {
      toast('Siswa berhasil dihapus', 'success')
    }
  }

  // Toolbar rendering
  const Toolbar = (
    <>
      <div className="flex flex-1 items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlass weight="bold" size={20} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full rounded-2xl border-border bg-muted/30 pl-10 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-11 border transition-colors"
            placeholder="Cari nama atau NIS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filter Kelas */}
        <select
          className="rounded-2xl border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 border bg-muted/30 text-foreground transition-colors"
          value={searchParams.get('kelas') || ''}
          onChange={(e) => updateUrlParams('kelas', e.target.value)}
        >
          <option value="">Semua Kelas</option>
          {availableClasses.map(c => (
            <option key={c.id} value={c.id}>Kelas {c.nama_kelas}</option>
          ))}
        </select>
        
        {/* Filter Status */}
        <select
          className="rounded-2xl border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 border bg-muted/30 text-foreground transition-colors"
          value={searchParams.get('status') || ''}
          onChange={(e) => updateUrlParams('status', e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="lulus">Lulus</option>
          <option value="keluar">Keluar</option>
        </select>
      </div>

      {!isReadOnly && (
        <Button variant="primary" onClick={handleAdd} className="rounded-2xl px-5 h-11">
          <Plus weight="bold" size={20} className="mr-2" /> Tambah Siswa
        </Button>
      )}
    </>
  )

  // Pagination rendering
  const Pagination = (
    <div className="flex items-center justify-between w-full px-2">
      <div className="text-sm text-muted-foreground">
        Menampilkan halaman <span className="font-medium text-foreground">{currentPage}</span> dari{' '}
        <span className="font-medium text-foreground">{totalPages || 1}</span> ({totalItems} total data)
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="rounded-xl"
          disabled={currentPage <= 1}
          onClick={() => updateUrlParams('page', String(currentPage - 1))}
        >
          Sebelumnya
        </Button>
        <Button
          variant="secondary"
          className="rounded-xl"
          disabled={currentPage >= totalPages}
          onClick={() => updateUrlParams('page', String(currentPage + 1))}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  )

  // Columns definition
  const columns = [
    { key: 'profil', label: 'Profil Siswa' },
    { key: 'nis', label: 'NIS / NIK' },
    { key: 'kelas', label: 'Kelas' },
    { key: 'status', label: 'Status' },
    { key: 'aksi', label: 'Aksi', className: 'text-right' },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        toolbar={Toolbar}
        pagination={totalPages > 1 ? Pagination : undefined}
        isEmpty={data.length === 0}
      >
        {data.map((siswa) => (
          <tr key={siswa.id} className="hover:bg-muted/50 transition-colors group">
            <td className="px-5 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-11 w-11 shrink-0 relative">
                  {siswa.foto ? (
                    <img className="h-11 w-11 rounded-[14px] object-cover border border-border shadow-sm" src={siswa.foto} alt="" />
                  ) : (
                    <div className="h-11 w-11 rounded-[14px] bg-muted flex items-center justify-center text-muted-foreground border border-border shadow-sm">
                      <User weight="duotone" className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-foreground">{siswa.nama_lengkap}</div>
                  <div className="text-muted-foreground text-sm">{siswa.jenis_kelamin}</div>
                </div>
              </div>
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
              <div className="text-foreground font-medium">{siswa.nis}</div>
              <div className="text-muted-foreground text-xs">{siswa.nik || '-'}</div>
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
              <Badge variant="info" className="rounded-lg px-2.5 py-1">
                {siswa.kelas?.nama_kelas ? `Kelas ${siswa.kelas.nama_kelas}` : 'Belum Ada'}
              </Badge>
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
              <Badge variant={siswa.status === 'aktif' ? 'success' : siswa.status === 'keluar' ? 'danger' : 'secondary'} className="rounded-lg px-2.5 py-1">
                {siswa.status.toUpperCase()}
              </Badge>
            </td>
            <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end gap-1">
                <button className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => handleDetail(siswa)} title="Detail">
                  <Eye weight="duotone" size={22} />
                </button>
                {!isReadOnly && (
                  <>
                    <button className="p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors" onClick={() => handleEdit(siswa)} title="Edit">
                      <PencilSimple weight="duotone" size={22} />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" onClick={() => handleDeletePrompt(siswa)} title="Hapus">
                      <Trash weight="duotone" size={22} />
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <SiswaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedData}
        availableClasses={availableClasses}
      />

      <SiswaDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={selectedData}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Siswa"
        description={`Apakah Anda yakin ingin menghapus data ${selectedData?.nama_lengkap}? Data ini dapat dipulihkan nanti.`}
        loading={isDeleting}
      />
    </>
  )
}
