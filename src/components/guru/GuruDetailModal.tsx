'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { User } from '@phosphor-icons/react'

interface GuruDetailModalProps {
  isOpen: boolean
  onClose: () => void
  data: any | null
}

export function GuruDetailModal({ isOpen, onClose, data }: GuruDetailModalProps) {
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

  const formatRole = (role: string) => {
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const roleVariants: Record<string, string> = {
    kepala_sekolah: 'primary',
    operator: 'info',
    bendahara: 'warning',
    guru: 'success'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil Pegawai"
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
            <img src={data.foto} alt="Foto Pegawai" className="h-40 w-40 object-cover rounded-2xl shadow-sm border border-border" />
          ) : (
            <div className="h-40 w-40 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border border-border shadow-sm">
              <User weight="duotone" className="h-16 w-16" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground mb-3 font-heading tracking-tight">{data.nama}</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant={roleVariants[data.role] || 'secondary' as any} className="px-3 py-1.5 text-sm rounded-lg">
              {formatRole(data.role)}
            </Badge>
            {data.kelas?.[0] && (
              <Badge variant="info" className="px-3 py-1.5 text-sm rounded-lg">Wali Kelas {data.kelas[0].nama_kelas}</Badge>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-card p-4 rounded-[16px] border border-border/60 shadow-sm">
            <div>
              <p className="font-semibold text-muted-foreground mb-1">NIK</p>
              <p className="text-foreground font-medium">{data.nik}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground mb-1">Username Login</p>
              <p className="font-mono bg-muted px-2 py-1 rounded-md text-xs w-fit text-foreground">{data.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 pt-4">
        <dl className="divide-y divide-border/60">
          <SectionTitle title="Data Pribadi & Kepegawaian" />
          <DataRow label="Tanggal Lahir" value={`${new Date(data.tanggal_lahir).toLocaleDateString('id-ID')} (${calculateAge(data.tanggal_lahir)})`} />
          <DataRow label="Pendidikan Terakhir" value={data.pendidikan} />
          <DataRow label="Nomor Anggota" value={data.nomor_anggota} />
          <DataRow label="NPWP" value={data.npwp} />
          <DataRow label="Periode" value={data.periode} />
          <DataRow label="Bergabung Sejak" value={new Date(data.created_at).toLocaleDateString('id-ID')} />
        </dl>
      </div>
    </Modal>
  )
}
