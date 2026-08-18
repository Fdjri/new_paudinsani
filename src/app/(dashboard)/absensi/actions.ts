'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/server'

/**
 * Menyimpan/memperbarui data absensi siswa.
 */
export async function upsertAbsensi(siswa_id: number, tanggal: string, status: string, keterangan: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Supabase RLS will handle permission checks (Kepsek and Guru only)
  // Ensure that status matches the Enum
  const { error } = await supabase
    .from('absensis')
    .upsert(
      {
        siswa_id,
        tanggal_absensi: tanggal,
        status: status as any,
        keterangan: keterangan || null,
      },
      {
        onConflict: 'siswa_id, tanggal_absensi',
      }
    )

  if (error) {
    console.error('Upsert absensi error:', error)
    return { error: 'Gagal menyimpan absensi: ' + error.message }
  }

  // Revalidate both possible paths
  revalidatePath(`/(dashboard)/kepala_sekolah/absensi/${tanggal}`)
  revalidatePath(`/(dashboard)/guru/absensi/${tanggal}`)

  return { success: true }
}

/**
 * Menghapus data absensi siswa jika guru mengubah status kembali ke "Belum Diisi".
 */
export async function deleteAbsensi(siswa_id: number, tanggal: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('absensis')
    .delete()
    .match({
      siswa_id,
      tanggal_absensi: tanggal,
    })

  if (error) {
    console.error('Delete absensi error:', error)
    return { error: 'Gagal menghapus absensi: ' + error.message }
  }

  revalidatePath(`/(dashboard)/kepala_sekolah/absensi/${tanggal}`)
  revalidatePath(`/(dashboard)/guru/absensi/${tanggal}`)

  return { success: true }
}
