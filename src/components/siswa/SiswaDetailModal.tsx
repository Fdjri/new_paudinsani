import * as React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { User } from '@phosphor-icons/react'

interface SiswaDetailModalProps {
  isOpen: boolean
  onClose: () => void
  data: any | null
}

export function SiswaDetailModal({ isOpen, onClose, data }: SiswaDetailModalProps) {
  if (!data) return null

  const calculateAge = (dob: string) => {
    const diff_ms = Date.now() - new Date(dob).getTime()
    const age_dt = new Date(diff_ms)
    return Math.abs(age_dt.getUTCFullYear() - 1970) + ' Tahun'
  }

  const DataRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <dt className="text-sm font-medium leading-6 text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-foreground sm:col-span-2 sm:mt-0 font-medium">{value || '-'}</dd>
    </div>
  )

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-base font-semibold leading-7 text-foreground mt-8 border-b border-border/60 pb-3">{title}</h3>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Profil Siswa"
      maxWidth="3xl"
      footer={
        <Button variant="secondary" onClick={onClose} className="rounded-xl px-6 h-11">
          Tutup
        </Button>
      }
    >
      <div className="flex flex-col md:flex-row gap-8 mb-8 items-start bg-muted/20 p-6 rounded-[24px] border border-border/60">
        <div className="shrink-0 flex justify-center w-full md:w-40">
          {data.foto ? (
            <img src={data.foto} alt="Foto Siswa" className="h-40 w-40 object-cover rounded-2xl shadow-sm border border-border" />
          ) : (
            <div className="h-40 w-40 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border border-border shadow-sm">
              <User weight="duotone" className="h-16 w-16" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground mb-3 font-heading tracking-tight">{data.nama_lengkap}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant={data.status === 'aktif' ? 'success' : data.status === 'keluar' ? 'danger' : 'secondary'} className="px-3 py-1.5 text-sm rounded-lg">
              {data.status.toUpperCase()}
            </Badge>
            <Badge variant="info" className="px-3 py-1.5 text-sm rounded-lg">Kelas {data.kelas?.nama_kelas || 'Belum Ada'}</Badge>
            <Badge variant="warning" className="px-3 py-1.5 text-sm rounded-lg">{data.tipe_murid}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <dl className="divide-y divide-border/60">
          <SectionTitle title="Informasi Pribadi" />
          <DataRow label="Nomor Induk Siswa (NIS)" value={data.nis} />
          <DataRow label="NIK" value={data.nik} />
          <DataRow label="Jenis Kelamin" value={data.jenis_kelamin} />
          <DataRow label="Tempat, Tanggal Lahir" value={`${data.tanggal_lahir} (${calculateAge(data.tanggal_lahir)})`} />
          <DataRow label="Alamat Tempat Tinggal" value={data.alamat_tempat_tinggal} />
          
          <SectionTitle title="Data Orang Tua" />
          <DataRow label="Nama Ayah" value={data.nama_ayah_kandung} />
          <DataRow label="Pekerjaan Ayah" value={data.pekerjaan_ayah} />
          <DataRow label="Nama Ibu" value={data.nama_ibu_kandung} />
          <DataRow label="Pekerjaan Ibu" value={data.pekerjaan_ibu} />

          {data.nama_wali && (
            <>
              <SectionTitle title="Data Wali" />
              <DataRow label="Nama Wali" value={data.nama_wali} />
              <DataRow label="Hubungan" value={data.hubungan_wali} />
            </>
          )}

          <SectionTitle title="Informasi Akademik" />
          <DataRow label="Tahun Masuk" value={data.tahun_masuk} />
        </dl>
      </div>
    </Modal>
  )
}
