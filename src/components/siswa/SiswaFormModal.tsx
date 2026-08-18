'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { uploadFile } from '@/lib/storage'
import { createSiswa, updateSiswa } from '@/app/(dashboard)/siswa/actions'

interface SiswaFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: any // jika ada, berarti mode edit
  onSuccess?: () => void
  availableClasses?: { id: number; nama_kelas: string }[]
}

export function SiswaFormModal({ isOpen, onClose, initialData, onSuccess, availableClasses = [] }: SiswaFormModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const isEdit = !!initialData

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const fileInput = e.currentTarget.elements.namedItem('file_foto') as HTMLInputElement
    const file = fileInput?.files?.[0]

    try {
      // 1. Upload foto jika ada file yang dipilih
      if (file) {
        // Hasilkan nama unik untuk foto (menggunakan NIS jika memungkinkan, atau timestamp)
        const nis = formData.get('nis') as string
        const fileName = `${nis || Date.now()}-${file.name}`
        const { url, error: uploadError } = await uploadFile('siswa-photos', fileName, file)
        
        if (uploadError) {
          toast('Gagal mengunggah foto: ' + uploadError, 'error')
          setLoading(false)
          return
        }
        
        if (url) {
          formData.set('foto', url)
        }
      } else if (initialData?.foto) {
        // Pertahankan foto lama jika tidak ada file baru
        formData.set('foto', initialData.foto)
      }

      // 2. Submit data ke server action
      const result = isEdit 
        ? await updateSiswa(initialData.id, formData)
        : await createSiswa(formData)

      if (result.error) {
        toast(result.error, 'error')
      } else {
        toast(isEdit ? 'Data siswa berhasil diperbarui' : 'Siswa berhasil ditambahkan', 'success')
        onSuccess?.()
        onClose()
      }
    } catch (error: any) {
      toast('Terjadi kesalahan yang tidak terduga', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Section Header helper
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="col-span-full mt-8 mb-4 pb-3 border-b border-border/60">
      <h3 className="text-lg font-semibold font-heading leading-6 text-foreground tracking-tight">{title}</h3>
    </div>
  )

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading} type="button" className="rounded-xl px-5 h-11">
        Batal
      </Button>
      <Button variant="primary" type="submit" form="siswa-form" disabled={loading} className="rounded-xl px-5 h-11">
        {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Siswa'}
      </Button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Siswa' : 'Tambah Siswa Baru'} maxWidth="4xl" footer={footer}>
      <form id="siswa-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        
        {/* --- DATA PRIBADI --- */}
        <SectionHeader title="Data Pribadi Siswa" />
        
        <div className="col-span-full flex items-center gap-5 mb-2 bg-muted/20 p-5 rounded-[20px] border border-border/60">
          {initialData?.foto && (
            <img src={initialData.foto} alt="Foto Lama" className="w-20 h-20 rounded-2xl object-cover border border-border shadow-sm" />
          )}
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Unggah Foto (Opsional)</label>
            <input type="file" name="file_foto" accept="image/*" className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors" />
          </div>
        </div>

        <Input label="NIS (Nomor Induk Siswa)" name="nis" required defaultValue={initialData?.nis} />
        <Input label="NIK" name="nik" defaultValue={initialData?.nik || ''} />
        <Input label="Nama Lengkap" name="nama_lengkap" required defaultValue={initialData?.nama_lengkap} />
        <Input label="Nama Panggilan" name="nama_panggilan" defaultValue={initialData?.nama_panggilan || ''} />
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Jenis Kelamin <span className="text-red-500">*</span></label>
          <select name="jenis_kelamin" required defaultValue={initialData?.jenis_kelamin || ''} className="block w-full rounded-[14px] border-border/60 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-11 px-4 border bg-card text-foreground transition-colors">
            <option value="" disabled>Pilih Jenis Kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <Input label="Tanggal Lahir" name="tanggal_lahir" type="date" required defaultValue={initialData?.tanggal_lahir} />
        <Input label="Agama" name="agama" defaultValue={initialData?.agama || ''} />
        <Input label="Kewarganegaraan" name="kewarganegaraan" defaultValue={initialData?.kewarganegaraan || 'Indonesia'} />
        
        <Input label="Anak Ke-" name="anak_ke" type="number" defaultValue={initialData?.anak_ke || ''} />
        <Input label="Jumlah Saudara Kandung" name="jumlah_saudara_kandung" type="number" defaultValue={initialData?.jumlah_saudara_kandung || ''} />
        
        <Input label="Berat Badan (kg)" name="berat_badan" type="number" step="0.1" defaultValue={initialData?.berat_badan || ''} />
        <Input label="Tinggi Badan (cm)" name="tinggi_badan" type="number" step="0.1" defaultValue={initialData?.tinggi_badan || ''} />
        
        <div className="col-span-full">
          <label className="block text-sm font-medium text-foreground mb-1.5">Alamat Tempat Tinggal <span className="text-red-500">*</span></label>
          <textarea name="alamat_tempat_tinggal" required defaultValue={initialData?.alamat_tempat_tinggal} rows={3} className="block w-full rounded-[14px] border-border/60 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm px-4 py-3 border bg-card text-foreground transition-colors"></textarea>
        </div>

        {/* --- DATA AKADEMIK --- */}
        <SectionHeader title="Data Akademik & Sekolah" />
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Kelas (Kosongkan untuk Auto-assign berdasar umur)</label>
          <select name="kelas_id" defaultValue={initialData?.kelas_id || ''} className="block w-full rounded-[14px] border-border/60 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-11 px-4 border bg-card text-foreground transition-colors">
            <option value="">-- Auto Assign --</option>
            {availableClasses.map(c => (
              <option key={c.id} value={c.id}>Kelas {c.nama_kelas}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Status Siswa</label>
          <select name="status" defaultValue={initialData?.status || 'aktif'} className="block w-full rounded-[14px] border-border/60 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-11 px-4 border bg-card text-foreground transition-colors">
            <option value="aktif">Aktif</option>
            <option value="lulus">Lulus</option>
            <option value="keluar">Keluar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Tipe Murid</label>
          <select name="tipe_murid" defaultValue={initialData?.tipe_murid || 'Siswa Baru'} className="block w-full rounded-[14px] border-border/60 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm h-11 px-4 border bg-card text-foreground transition-colors">
            <option value="Siswa Baru">Siswa Baru</option>
            <option value="Mutasi">Mutasi</option>
          </select>
        </div>

        <Input label="Tahun Masuk" name="tahun_masuk" type="number" defaultValue={initialData?.tahun_masuk || new Date().getFullYear()} />


        {/* --- DATA ORANG TUA --- */}
        <SectionHeader title="Data Orang Tua & Wali" />

        <div className="bg-muted/20 p-5 rounded-[20px] border border-border/60 col-span-full md:col-span-1 space-y-4">
          <h4 className="font-semibold text-foreground font-heading">Data Ayah</h4>
          <Input label="Nama Ayah Kandung" name="nama_ayah_kandung" defaultValue={initialData?.nama_ayah_kandung || ''} />
          <Input label="Pendidikan Ayah" name="pendidikan_ayah" defaultValue={initialData?.pendidikan_ayah || ''} />
          <Input label="Pekerjaan Ayah" name="pekerjaan_ayah" defaultValue={initialData?.pekerjaan_ayah || ''} />
        </div>

        <div className="bg-muted/20 p-5 rounded-[20px] border border-border/60 col-span-full md:col-span-1 space-y-4">
          <h4 className="font-semibold text-foreground font-heading">Data Ibu</h4>
          <Input label="Nama Ibu Kandung" name="nama_ibu_kandung" defaultValue={initialData?.nama_ibu_kandung || ''} />
          <Input label="Pendidikan Ibu" name="pendidikan_ibu" defaultValue={initialData?.pendidikan_ibu || ''} />
          <Input label="Pekerjaan Ibu" name="pekerjaan_ibu" defaultValue={initialData?.pekerjaan_ibu || ''} />
        </div>

        <div className="bg-muted/20 p-5 rounded-[20px] border border-border/60 col-span-full md:col-span-1 space-y-4 mb-4">
          <h4 className="font-semibold text-foreground font-heading">Data Wali (Opsional)</h4>
          <Input label="Nama Wali" name="nama_wali" defaultValue={initialData?.nama_wali || ''} />
          <Input label="Hubungan Wali" name="hubungan_wali" defaultValue={initialData?.hubungan_wali || ''} />
          <Input label="Pekerjaan Wali" name="pekerjaan_wali" defaultValue={initialData?.pekerjaan_wali || ''} />
        </div>

      </form>
    </Modal>
  )
}
