'use client'

import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { MagnifyingGlass, Plus, User, Eye, PencilSimple, Trash } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'motion/react'

import { GuruFormModal } from './GuruFormModal'
import { GuruDetailModal } from './GuruDetailModal'
import { deleteGuru } from '@/app/(dashboard)/guru/actions'

interface GuruTableClientProps {
  data: any[]
  totalItems: number
  currentPage: number
  totalPages: number
  availableClasses: { id: number; nama_kelas: string; guru_id: string | null }[]
}

export function GuruTableClient({
  data,
  totalItems,
  currentPage,
  totalPages,
  availableClasses,
}: GuruTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('q') || '')
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [selectedGuru, setSelectedGuru] = React.useState<any | null>(null)
  
  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [guruToDelete, setGuruToDelete] = React.useState<any | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Handlers for URL updates
  const updateUrl = (params: Record<string, string | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })
    const search = current.toString()
    const query = search ? `?${search}` : ''
    router.push(`${pathname}${query}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl({ q: searchQuery, page: '1' })
  }

  const handlePageChange = (page: number) => {
    updateUrl({ page: page.toString() })
  }

  // Action Handlers
  const handleAdd = () => {
    setSelectedGuru(null)
    setIsFormOpen(true)
  }

  const handleEdit = (guru: any) => {
    setSelectedGuru(guru)
    setIsFormOpen(true)
  }

  const handleDetail = (guru: any) => {
    setSelectedGuru(guru)
    setIsDetailOpen(true)
  }

  const handleDeletePrompt = (guru: any) => {
    setGuruToDelete(guru)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!guruToDelete) return
    setIsDeleting(true)
    try {
      const result = await deleteGuru(guruToDelete.auth_id)
      if (result.error) {
        toast(result.error, 'error')
      } else {
        toast('Pegawai berhasil dihapus', 'success')
      }
    } catch (error) {
      toast('Terjadi kesalahan saat menghapus', 'error')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setGuruToDelete(null)
    }
  }

  const formatRole = (role: string) => {
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const roleVariants: Record<string, string> = {
    kepala_sekolah: 'primary',
    operator: 'info',
    bendahara: 'warning',
    guru: 'success'
  }

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const cardVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-[24px] border border-border/60 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-md flex items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              name="q"
              placeholder="Cari nama atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[16px] border-border/60 bg-muted/30 pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors outline-none"
            />
          </div>
          <Button type="submit" variant="secondary" className="rounded-2xl px-6 h-12">Cari</Button>
        </form>
        <div className="flex items-center w-full sm:w-auto">
          <Button variant="primary" onClick={handleAdd} className="w-full sm:w-auto flex items-center gap-2 rounded-2xl px-6 h-12">
            <Plus weight="bold" className="w-5 h-5" />
            Tambah Pegawai
          </Button>
        </div>
      </div>

      {/* Grid Content */}
      {data.length === 0 ? (
        <div className="bg-card rounded-[32px] border border-border/60 p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
            <User weight="duotone" className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground font-heading">Tidak ada data pegawai</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Pegawai yang Anda cari tidak ditemukan atau belum ada data yang ditambahkan.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {data.map((guru) => (
            <motion.div 
              key={guru.id}
              variants={cardVariants}
              className="group relative bg-card rounded-[32px] border border-border/60 p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col h-full overflow-hidden"
            >
              {/* Card Header: Avatar & Quick Actions */}
              <div className="flex justify-between items-start mb-4">
                <div className="relative w-20 h-20 rounded-[24px] overflow-hidden border border-border shadow-sm bg-muted flex-shrink-0">
                  {guru.foto ? (
                    <img 
                      src={guru.foto} 
                      alt={guru.nama} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <User weight="duotone" className="w-8 h-8" />
                    </div>
                  )}
                </div>
                
                {/* Actions: Appear on hover */}
                <div className="flex items-center gap-1 mt-2">
                  <button 
                    onClick={() => handleDetail(guru)}
                    className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    title="Detail"
                  >
                    <Eye weight="duotone" size={22} />
                  </button>
                  <button 
                    onClick={() => handleEdit(guru)}
                    className="p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PencilSimple weight="duotone" size={22} />
                  </button>
                  <button 
                    onClick={() => handleDeletePrompt(guru)}
                    className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash weight="duotone" size={22} />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground font-heading tracking-tight leading-tight mb-1 line-clamp-1">{guru.nama}</h3>
                <div className="text-sm text-muted-foreground font-mono mb-4">{guru.username}</div>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={roleVariants[guru.role] || 'secondary' as any} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide">
                      {formatRole(guru.role)}
                    </Badge>
                    {guru.kelas?.[0] && (
                      <Badge variant="info" className="px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide">
                        Wali Kelas {guru.kelas[0].nama_kelas}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/60">
                    <span className="font-medium">NIK:</span> {guru.nik || '-'}
                    <span className="text-border/40">•</span>
                    <span className="font-medium">No:</span> {guru.nomor_anggota || '-'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan <span className="font-medium text-foreground">{(currentPage - 1) * 6 + 1}</span> hingga{' '}
            <span className="font-medium text-foreground">{Math.min(currentPage * 6, totalItems)}</span> dari{' '}
            <span className="font-medium text-foreground">{totalItems}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="rounded-xl h-10"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="secondary"
              className="rounded-xl h-10"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <GuruFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedGuru}
        availableClasses={availableClasses}
      />

      <GuruDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={selectedGuru}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Pegawai"
        description={
          guruToDelete?.kelas?.[0] 
          ? `Apakah Anda yakin ingin menghapus ${guruToDelete.nama}? PERINGATAN: Pegawai ini adalah Wali Kelas ${guruToDelete.kelas[0].nama_kelas}. Menghapus akun akan mencopotnya dari jabatan wali kelas.` 
          : `Apakah Anda yakin ingin menghapus profil dan akun ${guruToDelete?.nama}? Data riwayat absensi atau pembayaran yang pernah dibuat oleh akun ini tetap akan dipertahankan.`
        }
        confirmText="Hapus Permanen"
        cancelText="Batal"
        loading={isDeleting}
      />
    </div>
  )
}
