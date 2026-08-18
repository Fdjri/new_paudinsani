'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/server'

export async function upsertKeuangan(
  id: number | null,
  deskripsi: string,
  tipe: 'pemasukan' | 'pengeluaran',
  tanggal: string,
  jumlah: number,
  biaya: number
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()
  if (userData?.role !== 'kepala_sekolah' && userData?.role !== 'bendahara') {
    return { error: 'Unauthorized role' }
  }

  // Validasi dasar
  if (!deskripsi || jumlah <= 0 || biaya <= 0) {
    return { error: 'Data tidak valid. Pastikan jumlah dan biaya lebih dari 0.' }
  }

  const payload = {
    deskripsi,
    tipe,
    tanggal,
    jumlah,
    biaya,
  }

  let result
  if (id) {
    // Update
    result = await supabase
      .from('keuangans')
      .update(payload)
      .eq('id', id)
  } else {
    // Insert
    result = await supabase
      .from('keuangans')
      .insert([payload])
  }

  if (result.error) {
    console.error('Upsert keuangan error:', result.error)
    return { error: 'Gagal menyimpan transaksi: ' + result.error.message }
  }

  revalidatePath('/(dashboard)/kepala_sekolah/keuangan')
  revalidatePath('/(dashboard)/bendahara/keuangan')

  return { success: true }
}

export async function deleteKeuangan(id: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()
  // Sesuai konfirmasi, keduanya boleh hapus
  if (userData?.role !== 'kepala_sekolah' && userData?.role !== 'bendahara') {
    return { error: 'Unauthorized role' }
  }

  const { error } = await supabase
    .from('keuangans')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete keuangan error:', error)
    return { error: 'Gagal menghapus transaksi: ' + error.message }
  }

  revalidatePath('/(dashboard)/kepala_sekolah/keuangan')
  revalidatePath('/(dashboard)/bendahara/keuangan')

  return { success: true }
}
