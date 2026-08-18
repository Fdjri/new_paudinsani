'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, MagnifyingGlass as Search, Funnel as Filter, Trash, PencilSimple, Download, TrendUp as TrendingUp, TrendDown as TrendingDown, Wallet } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { exportKeuanganToExcel } from '@/lib/export'
import { upsertKeuangan, deleteKeuangan } from '@/app/(dashboard)/keuangan/actions'

interface KeuanganRow {
  id: number
  deskripsi: string
  tipe: 'pemasukan' | 'pengeluaran'
  tanggal: string
  jumlah: number
  biaya: number
}

interface KeuanganClientProps {
  data: KeuanganRow[]
  summary: {
    total_pemasukan: number
    total_pengeluaran: number
    total_dana: number
  }
  filters: {
    tahun: string
    bulan: string
    tipe: string
    search: string
  }
  basePath: string
}

export function KeuanganClient({ data, summary, filters, basePath }: KeuanganClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Local state for filters
  const [searchQuery, setSearchQuery] = React.useState(filters.search)
  const [bulan, setBulan] = React.useState(filters.bulan)
  const [tahun, setTahun] = React.useState(filters.tahun)
  const [tipe, setTipe] = React.useState(filters.tipe)

  // Local state for modal
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<KeuanganRow | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState<number | null>(null)

  // Form states
  const [formTanggal, setFormTanggal] = React.useState('')
  const [formDeskripsi, setFormDeskripsi] = React.useState('')
  const [formTipe, setFormTipe] = React.useState<'pemasukan' | 'pengeluaran'>('pemasukan')
  const [formJumlah, setFormJumlah] = React.useState('1')
  const [formBiaya, setFormBiaya] = React.useState('')

  // Years for filter (current year and 5 years back)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (bulan) params.set('bulan', bulan)
    if (tahun) params.set('tahun', tahun)
    if (tipe) params.set('tipe', tipe)
    
    router.push(`${basePath}?${params.toString()}`)
  }

  // Handle enter key in search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters()
  }

  // Handle export
  const handleExport = () => {
    if (data.length === 0) {
      toast('Tidak ada data untuk diekspor', 'warning')
      return
    }

    const exportData = data.map(d => ({
      tanggal: d.tanggal,
      deskripsi: d.deskripsi,
      tipe: d.tipe,
      jumlah: d.jumlah,
      biaya_satuan: d.biaya,
      total: d.jumlah * d.biaya
    }))

    const fileName = `Laporan_Keuangan_${tahun || 'Semua'}_${bulan ? 'Bln'+bulan : 'Semua'}`
    exportKeuanganToExcel(exportData, fileName)
    toast('Data berhasil diekspor ke Excel', 'success')
  }

  // Open modal for add
  const handleAdd = () => {
    setEditItem(null)
    setFormTanggal(new Date().toISOString().split('T')[0])
    setFormDeskripsi('')
    setFormTipe('pemasukan')
    setFormJumlah('1')
    setFormBiaya('')
    setIsModalOpen(true)
  }

  // Open modal for edit
  const handleEdit = (item: KeuanganRow) => {
    setEditItem(item)
    setFormTanggal(item.tanggal)
    setFormDeskripsi(item.deskripsi)
    setFormTipe(item.tipe)
    setFormJumlah(item.jumlah.toString())
    setFormBiaya(item.biaya.toString())
    setIsModalOpen(true)
  }

  // Save transaction
  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      const result = await upsertKeuangan(
        editItem ? editItem.id : null,
        formDeskripsi,
        formTipe,
        formTanggal,
        parseInt(formJumlah),
        parseFloat(formBiaya)
      )
      
      if (result.error) throw new Error(result.error)
      
      toast(editItem ? 'Transaksi diperbarui' : 'Transaksi ditambahkan', 'success')
      setIsModalOpen(false)
    } catch (error: any) {
      toast(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete transaction
  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan.')) return
    
    setIsDeleting(id)
    try {
      const result = await deleteKeuangan(id)
      if (result.error) throw new Error(result.error)
      toast('Transaksi dihapus', 'success')
    } catch (error: any) {
      toast(error.message, 'error')
    } finally {
      setIsDeleting(null)
    }
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka)
  }

  return (
    <div className="space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <TrendingUp weight="bold" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Pemasukan</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{formatRupiah(summary.total_pemasukan)}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <TrendingDown weight="bold" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Pengeluaran</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{formatRupiah(summary.total_pengeluaran)}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 ring-1 ring-blue-500">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Wallet weight="duotone" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Total Saldo Dana</p>
            <h3 className="text-2xl font-bold font-heading text-gray-900">{formatRupiah(summary.total_dana)}</h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 bg-gray-50"
            />
          </div>
          <select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-10 px-3 border bg-gray-50"
          >
            <option value="">Semua Bulan</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>Bulan {m}</option>
            ))}
          </select>
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-10 px-3 border bg-gray-50"
          >
            <option value="">Semua Tahun</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={tipe}
            onChange={(e) => setTipe(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-10 px-3 border bg-gray-50"
          >
            <option value="">Semua Tipe</option>
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>
          <Button variant="secondary" onClick={applyFilters}>Terapkan Filter</Button>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <Button variant="secondary" onClick={handleExport} className="flex items-center gap-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200">
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4 text-right">Jml</th>
                <th className="px-6 py-4 text-right">Biaya Satuan</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data transaksi yang ditemukan.
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const total = item.jumlah * item.biaya
                  const isDeletingItem = isDeleting === item.id
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isDeletingItem ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.deskripsi}
                      </td>
                      <td className="px-6 py-4">
                        {item.tipe === 'pemasukan' ? (
                          <Badge variant="success">Pemasukan</Badge>
                        ) : (
                          <Badge variant="danger">Pengeluaran</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {item.jumlah}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {formatRupiah(item.biaya)}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${item.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {item.tipe === 'pengeluaran' ? '-' : '+'}
                        {formatRupiah(total)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={isDeletingItem}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilSimple weight="duotone" size={22} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeletingItem}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash weight="duotone" size={22} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold font-heading text-gray-900">
                {editItem ? 'Edit Transaksi' : 'Tambah Transaksi'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <Input
                  type="date"
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Transaksi</label>
                <select
                  value={formTipe}
                  onChange={(e) => setFormTipe(e.target.value as any)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3 border bg-white"
                >
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <Input
                  type="text"
                  placeholder="Contoh: Beli Spidol, SPP Siswa, dll"
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                  <Input
                    type="number"
                    min="1"
                    value={formJumlah}
                    onChange={(e) => setFormJumlah(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Satuan</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">Rp</span>
                    <Input
                      type="number"
                      min="0"
                      value={formBiaya}
                      onChange={(e) => setFormBiaya(e.target.value)}
                      className="w-full pl-9"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Total:</span>
                <span className={`text-lg font-bold ${formTipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatRupiah((parseInt(formJumlah) || 0) * (parseFloat(formBiaya) || 0))}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
