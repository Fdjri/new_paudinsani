'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/server'

/**
 * Menyimpan/memperbarui data pembayaran SPP.
 * user_id pencatat akan otomatis disematkan dari session.
 */
export async function upsertPembayaran(
  siswa_id: number,
  tahun_ajaran: number,
  bulan_pembayaran: number,
  status: string,
  jumlah_bayar: number,
  keterangan: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get user database ID for 'user_id' reference
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()
    
  if (!userData) return { error: 'User profile not found' }

  // Tanggal bayar = hari ini jika baru, jika update biarkan atau update juga? 
  // Untuk kesederhanaan, kita set ke hari ini (saat tombol ditekan)
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('pembayarans')
    .upsert(
      {
        siswa_id,
        user_id: userData.id, // Pencatat
        jenis_pembayaran: 'SPP',
        tahun_ajaran,
        bulan_pembayaran,
        jumlah_bayar,
        tanggal_bayar: today,
        status: status as any,
        keterangan: keterangan || null,
      },
      {
        onConflict: 'siswa_id, tahun_ajaran, bulan_pembayaran, jenis_pembayaran',
      }
    )

  if (error) {
    console.error('Upsert pembayaran error:', error)
    return { error: 'Gagal menyimpan pembayaran: ' + error.message }
  }

  revalidatePath(`/(dashboard)/kepala_sekolah/spp/${tahun_ajaran}/${bulan_pembayaran}`)
  revalidatePath(`/(dashboard)/bendahara/spp/${tahun_ajaran}/${bulan_pembayaran}`)

  return { success: true }
}

/**
 * Menghapus data pembayaran jika status diubah ke "Belum Lunas".
 */
export async function deletePembayaran(
  siswa_id: number,
  tahun_ajaran: number,
  bulan_pembayaran: number
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('pembayarans')
    .delete()
    .match({
      siswa_id,
      tahun_ajaran,
      bulan_pembayaran,
      jenis_pembayaran: 'SPP'
    })

  if (error) {
    console.error('Delete pembayaran error:', error)
    return { error: 'Gagal menghapus pembayaran: ' + error.message }
  }

  revalidatePath(`/(dashboard)/kepala_sekolah/spp/${tahun_ajaran}/${bulan_pembayaran}`)
  revalidatePath(`/(dashboard)/bendahara/spp/${tahun_ajaran}/${bulan_pembayaran}`)

  return { success: true }
}
