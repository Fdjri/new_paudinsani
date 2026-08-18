'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { uploadFile } from '@/lib/storage'
import { createGuru, updateGuru } from '@/app/(dashboard)/guru/actions'

interface GuruFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: any // jika ada, berarti mode edit
  availableClasses?: { id: number; nama_kelas: string; guru_id: string | null }[]
}

export function GuruFormModal({ isOpen, onClose, initialData, availableClasses = [] }: GuruFormModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const isEdit = !!initialData

  // Coba cari kelas yang saat ini diampu oleh guru ini
  const currentKelasId = React.useMemo(() => {
    if (!initialData) return ''
    const kelas = availableClasses.find(c => c.guru_id === initialData.id)
    return kelas ? kelas.id.toString() : ''
  }, [initialData, availableClasses])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const fileInput = e.currentTarget.elements.namedItem('file_foto') as HTMLInputElement
    const file = fileInput?.files?.[0]

    try {
      // 1. Upload foto jika ada file yang dipilih
      if (file) {
        const username = formData.get('username') as string
        const fileName = `${username}-${Date.now()}-${file.name}`
        const { url, error: uploadError } = await uploadFile('avatars', fileName, file)
        
        if (uploadError) {
          toast('Gagal mengunggah foto: ' + uploadError, 'error')
          setLoading(false)
          return
        }
        
        if (url) {
          formData.set('foto', url)
        }
      } else if (initialData?.foto) {
        formData.set('foto', initialData.foto)
      }

      // 2. Validasi NIK di sisi klien
      const nik = formData.get('nik') as string
      if (nik.length !== 16) {
        toast('NIK harus berjumlah persis 16 digit angka.', 'error')
        setLoading(false)
        return
      }

      // 3. Submit data ke server action
      const result = isEdit 
        ? await updateGuru(initialData.id, initialData.auth_id, formData)
        : await createGuru(formData)

      if (result.error) {
        toast(result.error, 'error')
      } else {
        toast(isEdit ? 'Data pegawai berhasil diperbarui' : 'Pegawai berhasil ditambahkan', 'success')
        onClose()
      }
    } catch (error: any) {
      toast('Terjadi kesalahan yang tidak terduga', 'error')
    } finally {
      setLoading(false)
    }
  }

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading} type="button" className="rounded-xl px-5 h-11">
        Batal
      </Button>
      <Button variant="primary" type="submit" form="guru-form" disabled={loading} className="rounded-xl px-5 h-11">
        {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Pegawai'}
      </Button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Pegawai' : 'Tambah Pegawai Baru'} maxWidth="2xl" footer={footer}>
      <form id="guru-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        
        <div className="col-span-full flex items-center gap-5 mb-2 bg-muted/20 p-5 rounded-[20px] border border-border/60">
          {initialData?.foto && (
            <img src={initialData.foto} alt="Foto Profil" className="w-20 h-20 rounded-2xl object-cover border border-border shadow-sm" />
          )}
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Unggah Pasfoto (Opsional)</label>
            <input type="file" name="file_foto" accept="image/*" className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors" />
          </div>
        </div>

        <Input label="Nama Lengkap" name="nama" required defaultValue={initialData?.nama} />
        
        <Input 
          label="NIK (16 Digit)" 
          name="nik" 
          required 
          defaultValue={initialData?.nik} 
          type="number"
          minLength={16}
          maxLength={16}
        />

        <Input 
          label="Tanggal Lahir" 
          name="tanggal_lahir" 
          type="date" 
          required 
          defaultValue={initialData?.tanggal_lahir} 
        />

        <div className="sm:col-span-2 border-t border-border/60 mt-2 pt-6">
          <h4 className="text-sm font-semibold font-heading text-foreground mb-4 tracking-tight">Kredensial Login & Akses</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Hak Akses (Role) <span className="text-red-500">*</span></label>
          <select name="role" required defaultValue={initialData?.role || 'guru'} className="block w-full rounded-[14px] border-border/60 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-11 px-4 border bg-card text-foreground transition-colors">
            <option value="guru">Guru</option>
            <option value="operator">Operator</option>
            <option value="bendahara">Bendahara</option>
            <option value="kepala_sekolah">Kepala Sekolah</option>
          </select>
        </div>

        <Input 
          label="Username" 
          name="username" 
          required 
          defaultValue={initialData?.username} 
          placeholder="Tanpa spasi"
        />

        <div className="sm:col-span-2">
          <Input 
            label={isEdit ? 'Password Baru (Kosongkan jika tidak ingin diubah)' : 'Password'} 
            name="password" 
            type="password" 
            required={!isEdit} 
            placeholder="Minimal 6 karakter"
          />
        </div>

        <div className="sm:col-span-2 border-t border-border/60 mt-2 pt-6">
          <h4 className="text-sm font-semibold font-heading text-foreground mb-4 tracking-tight">Penugasan Wali Kelas</h4>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Jadikan Wali Kelas (Opsional)</label>
          <select name="kelas_id" defaultValue={currentKelasId} className="block w-full rounded-[14px] border-border/60 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-11 px-4 border bg-card text-foreground transition-colors">
            <option value="">-- Tidak ditugaskan --</option>
            {availableClasses.map(c => (
              <option key={c.id} value={c.id}>
                Kelas {c.nama_kelas} {c.guru_id && c.guru_id !== initialData?.id ? '(Akan menggantikan wali kelas saat ini)' : ''}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted-foreground">Jika Anda memilih kelas yang sudah memiliki wali, wali lama akan tergantikan.</p>
        </div>

        <div className="sm:col-span-2 border-t border-border/60 mt-2 pt-6">
          <h4 className="text-sm font-semibold font-heading text-foreground mb-4 tracking-tight">Informasi Tambahan Kepegawaian</h4>
        </div>

        <Input label="Nomor Anggota" name="nomor_anggota" defaultValue={initialData?.nomor_anggota || ''} />
        <Input label="Pendidikan Terakhir" name="pendidikan" defaultValue={initialData?.pendidikan || ''} />
        <Input label="NPWP" name="npwp" defaultValue={initialData?.npwp || ''} />
        <Input label="Periode" name="periode" defaultValue={initialData?.periode || ''} placeholder="Contoh: 2023/2024" />

      </form>
    </Modal>
  )
}
