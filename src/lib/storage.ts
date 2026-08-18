import { createClient } from './client'

/**
 * Mengunggah file ke Supabase Storage.
 * @param bucket Nama bucket (misal: 'siswa-photos')
 * @param path Path folder/file tujuan (misal: `id_siswa/photo.jpg`)
 * @param file File yang akan diunggah
 * @returns Object berisi `url` publik jika sukses, atau `error` jika gagal.
 */
export async function uploadFile(bucket: string, path: string, file: File) {
  const supabase = createClient()

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError.message)
      return { error: uploadError.message }
    }

    // Mendapatkan URL publik
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return { url: publicUrlData.publicUrl }
  } catch (error: any) {
    console.error('Exception during upload:', error.message)
    return { error: error.message }
  }
}
