'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, MagnifyingGlass } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { upsertPembayaran, deletePembayaran } from '@/app/(dashboard)/spp/actions'

interface StudentData {
  id: number
  nis: string
  nama_lengkap: string
  foto: string | null
  kelas: { nama_kelas: string } | null
  pembayaran: {
    status: string
    jumlah_bayar: number
    keterangan: string | null
    pencatat: { nama: string } | null
  } | null
}

interface SppFormClientProps {
  tahunAjaran: number
  bulan: number
  nominalSpp: number
  students: StudentData[]
  backPath: string
}

export function SppFormClient({ tahunAjaran, bulan, nominalSpp, students, backPath }: SppFormClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = React.useState('')
  const [kelasFilter, setKelasFilter] = React.useState('')

  // Optimistic UI state
  const [sppState, setSppState] = React.useState<Record<number, { status: string; jumlah_bayar: number; keterangan: string }>>(() => {
    const initialState: Record<number, any> = {}
    students.forEach(s => {
      initialState[s.id] = {
        status: s.pembayaran?.status || '',
        jumlah_bayar: s.pembayaran?.jumlah_bayar || nominalSpp,
        keterangan: s.pembayaran?.keterangan || ''
      }
    })
    return initialState
  })
  
  const [savingStatus, setSavingStatus] = React.useState<Record<number, boolean>>({})

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const monthName = monthNames[bulan - 1]

  const filteredStudents = students.filter(s => {
    const matchName = s.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery)
    const matchKelas = kelasFilter ? s.kelas?.nama_kelas === kelasFilter : true
    return matchName && matchKelas
  })

  // Format currency
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka)
  }

  const handleUpdate = async (siswaId: number, field: string, value: string | number) => {
    const prevState = sppState[siswaId]
    const isStatusChange = field === 'status'
    
    // Status "" means "Belum Lunas" logically in our DB (deleted)
    let newStatus = isStatusChange ? value as string : prevState.status
    let newJumlah = field === 'jumlah_bayar' ? Number(value) : prevState.jumlah_bayar
    let newKet = field === 'keterangan' ? value as string : prevState.keterangan

    // Optimistic Update
    setSppState(prev => ({
      ...prev,
      [siswaId]: {
        status: newStatus,
        jumlah_bayar: newJumlah,
        keterangan: newKet
      }
    }))
    
    setSavingStatus(prev => ({ ...prev, [siswaId]: true }))

    try {
      if (newStatus === '') {
        // Hapus record (Belum Lunas)
        const result = await deletePembayaran(siswaId, tahunAjaran, bulan)
        if (result.error) throw new Error(result.error)
      } else {
        // Upsert record
        const result = await upsertPembayaran(siswaId, tahunAjaran, bulan, newStatus, newJumlah, newKet)
        if (result.error) throw new Error(result.error)
      }
    } catch (error: any) {
      toast('Gagal menyimpan SPP: ' + error.message, 'error')
      // Revert
      setSppState(prev => ({ ...prev, [siswaId]: prevState }))
    } finally {
      setSavingStatus(prev => ({ ...prev, [siswaId]: false }))
    }
  }

  const statusColors: Record<string, string> = {
    '': 'border-red-300 bg-red-50 text-red-700 font-medium',
    'Cicil': 'border-amber-500 bg-amber-50 text-amber-700 font-medium',
    'Lunas': 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium',
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-start sm:items-center gap-4">
          <Button variant="secondary" onClick={() => router.push(backPath)} className="shrink-0 p-2 h-10 w-10 p-0 flex items-center justify-center">
            <ArrowLeft weight="bold" className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">
              SPP: {monthName} {tahunAjaran}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Nominal standar: <strong>{formatRupiah(nominalSpp)}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50">
          <div className="relative w-full sm:max-w-xs">
            <MagnifyingGlass weight="bold" className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              name="q"
              placeholder="Cari nama atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full bg-white"
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3 border bg-white"
            >
              <option value="">Semua Kelas</option>
              <option value="A">Kelas A</option>
              <option value="B">Kelas B</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">Status & Nominal</th>
                <th className="px-6 py-4 min-w-[200px]">Keterangan</th>
                <th className="px-6 py-4 text-right">Pencatat / Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada siswa yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((siswa) => {
                  const state = sppState[siswa.id]
                  const isSaving = savingStatus[siswa.id]
                  const originalPencatat = siswa.pembayaran?.pencatat?.nama || '-'
                  
                  return (
                    <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 shrink-0">
                            {siswa.foto ? (
                              <img className="h-10 w-10 rounded-full object-cover border" src={siswa.foto} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border">
                                <User weight="duotone" className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{siswa.nama_lengkap}</div>
                            <div className="text-gray-500 flex items-center gap-2">
                              <span>NIS: {siswa.nis}</span>
                              <span className="text-gray-300">•</span>
                              <Badge variant="info">Kelas {siswa.kelas?.nama_kelas || '-'}</Badge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 w-full sm:w-48">
                          <select
                            value={state.status}
                            onChange={(e) => handleUpdate(siswa.id, 'status', e.target.value)}
                            className={`block w-full rounded-md shadow-sm sm:text-sm h-9 px-3 transition-colors ${statusColors[state.status]}`}
                          >
                            <option value="">Belum Lunas</option>
                            <option value="Cicil">Cicil</option>
                            <option value="Lunas">Lunas</option>
                          </select>
                          
                          {/* Only show input if status is not empty */}
                          <div className={`relative ${state.status === '' ? 'opacity-50 pointer-events-none' : ''}`}>
                            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                            <input
                              type="number"
                              defaultValue={state.jumlah_bayar}
                              onBlur={(e) => handleUpdate(siswa.id, 'jumlah_bayar', e.target.value)}
                              disabled={state.status === ''}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-9 pl-9 pr-3 border disabled:bg-gray-100 transition-colors"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <textarea
                          rows={2}
                          defaultValue={state.keterangan}
                          onBlur={(e) => handleUpdate(siswa.id, 'keterangan', e.target.value)}
                          disabled={state.status === ''}
                          placeholder={state.status === '' ? '-' : 'Catatan pembayaran...'}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border disabled:bg-gray-100 disabled:text-gray-400 transition-colors resize-none"
                        />
                      </td>
                      <td className="px-6 py-4 text-right align-top">
                        {isSaving ? (
                          <div className="text-xs text-blue-600 font-medium animate-pulse mt-1">Menyimpan...</div>
                        ) : state.status !== '' ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Tersimpan
                            </span>
                            <span className="text-[11px] text-gray-400">Pencatat: {originalPencatat}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 mt-1 block">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
