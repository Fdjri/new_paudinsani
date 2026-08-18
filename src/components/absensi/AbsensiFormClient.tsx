'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, MagnifyingGlass as Search } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { upsertAbsensi, deleteAbsensi } from '@/app/(dashboard)/absensi/actions'

interface StudentData {
  id: number
  nis: string
  nama_lengkap: string
  foto: string | null
  kelas: { nama_kelas: string } | null
  absensi: {
    status: string
    keterangan: string | null
  } | null
}

interface AbsensiFormClientProps {
  date: string
  students: StudentData[]
  holiday?: { name: string, localName: string }
  backPath: string
}

export function AbsensiFormClient({ date, students, holiday, backPath }: AbsensiFormClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = React.useState('')
  const [kelasFilter, setKelasFilter] = React.useState('')

  // State to hold optimistic UI updates
  const [attendanceState, setAttendanceState] = React.useState<Record<number, { status: string; keterangan: string }>>(() => {
    const initialState: Record<number, any> = {}
    students.forEach(s => {
      initialState[s.id] = {
        status: s.absensi?.status || '',
        keterangan: s.absensi?.keterangan || ''
      }
    })
    return initialState
  })
  
  const [savingStatus, setSavingStatus] = React.useState<Record<number, boolean>>({})

  // Format date nicely
  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchName = s.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery)
    const matchKelas = kelasFilter ? s.kelas?.nama_kelas === kelasFilter : true
    return matchName && matchKelas
  })

  // Handle status change
  const handleStatusChange = async (siswaId: number, newStatus: string) => {
    const prevState = attendanceState[siswaId]
    
    // Optimistic update
    setAttendanceState(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], status: newStatus }
    }))
    
    setSavingStatus(prev => ({ ...prev, [siswaId]: true }))

    try {
      if (newStatus === '') {
        // Hapus record (Belum Diisi)
        const result = await deleteAbsensi(siswaId, date)
        if (result.error) throw new Error(result.error)
      } else {
        // Upsert record
        const keterangan = attendanceState[siswaId].keterangan
        const result = await upsertAbsensi(siswaId, date, newStatus, keterangan)
        if (result.error) throw new Error(result.error)
      }
    } catch (error: any) {
      toast('Gagal menyimpan absensi: ' + error.message, 'error')
      // Revert optimistic update
      setAttendanceState(prev => ({
        ...prev,
        [siswaId]: prevState
      }))
    } finally {
      setSavingStatus(prev => ({ ...prev, [siswaId]: false }))
    }
  }

  // Handle keterangan blur (we save on blur to avoid too many requests)
  const handleKeteranganBlur = async (siswaId: number, newKeterangan: string) => {
    const currentStatus = attendanceState[siswaId].status
    // If status is empty, don't save keterangan since record doesn't exist
    if (currentStatus === '') return
    
    // If it hasn't changed, don't save
    if (attendanceState[siswaId].keterangan === newKeterangan) return

    setSavingStatus(prev => ({ ...prev, [siswaId]: true }))

    try {
      const result = await upsertAbsensi(siswaId, date, currentStatus, newKeterangan)
      if (result.error) throw new Error(result.error)
      
      // Update state if success
      setAttendanceState(prev => ({
        ...prev,
        [siswaId]: { ...prev[siswaId], keterangan: newKeterangan }
      }))
    } catch (error: any) {
      toast('Gagal menyimpan keterangan: ' + error.message, 'error')
      // Force re-render of input with old value by not updating state
    } finally {
      setSavingStatus(prev => ({ ...prev, [siswaId]: false }))
    }
  }

  const statusColors: Record<string, string> = {
    '': 'border-gray-300 bg-white text-gray-700',
    'Hadir': 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium',
    'Sakit': 'border-blue-500 bg-blue-50 text-blue-700 font-medium',
    'Izin': 'border-amber-500 bg-amber-50 text-amber-700 font-medium',
    'Alpa': 'border-red-500 bg-red-50 text-red-700 font-medium',
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
              Absensi: {formattedDate}
            </h1>
            {holiday ? (
              <p className="text-red-600 text-sm mt-1 font-medium flex items-center gap-1">
                Hari Libur Nasional: {holiday.localName} ({holiday.name})
              </p>
            ) : (
              <p className="text-gray-500 text-sm mt-1">Isi daftar hadir siswa pada hari ini.</p>
            )}
          </div>
        </div>
      </div>

      {holiday && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start gap-3">
          <div className="font-bold">⚠️ Perhatian:</div>
          <div>Tanggal ini tercatat sebagai hari libur nasional. Anda tetap bisa mengisi absensi jika ada kegiatan khusus, namun secara default sistem tidak mengharapkan pengisian.</div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50">
          <div className="relative w-full sm:max-w-xs">
            <Search weight="bold" className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
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
                <th className="px-6 py-4">Status Kehadiran</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4 text-right">Progress</th>
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
                  const state = attendanceState[siswa.id]
                  const isSaving = savingStatus[siswa.id]
                  
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
                        <select
                          value={state.status}
                          onChange={(e) => handleStatusChange(siswa.id, e.target.value)}
                          className={`block w-full sm:w-40 rounded-md shadow-sm sm:text-sm h-9 px-3 transition-colors ${statusColors[state.status]}`}
                        >
                          <option value="">-- Belum Diisi --</option>
                          <option value="Hadir">Hadir</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Izin">Izin</option>
                          <option value="Alpa">Alpa</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          defaultValue={state.keterangan}
                          onBlur={(e) => handleKeteranganBlur(siswa.id, e.target.value)}
                          disabled={state.status === ''}
                          placeholder={state.status === '' ? 'Pilih status dulu' : 'Tambahkan keterangan...'}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-9 px-3 border disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isSaving ? (
                          <span className="text-xs text-blue-600 font-medium animate-pulse">Menyimpan...</span>
                        ) : state.status !== '' ? (
                          <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Tersimpan
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
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
