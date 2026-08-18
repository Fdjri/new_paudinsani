'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, updatePassword } from '@/app/(dashboard)/profile/actions'
import { createClient } from '@/lib/client'
import imageCompression from 'browser-image-compression'
import { Camera, FloppyDisk as Save, Key, Lock, WarningCircle as AlertCircle, CheckCircle as CheckCircle2 } from '@phosphor-icons/react'

type ProfileClientProps = {
  user: any // Dari tabel public.users
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const [previewFoto, setPreviewFoto] = useState<string>(user.foto || '')
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file tidak boleh lebih dari 5MB.')
        return
      }

      // Preview sebelum kompresi
      const objectUrl = URL.createObjectURL(file)
      setPreviewFoto(objectUrl)

      try {
        const options = {
          maxSizeMB: 0.5, // max 500KB
          maxWidthOrHeight: 800,
          useWebWorker: true
        }
        const compressedFile = await imageCompression(file, options)
        setFileToUpload(compressedFile)
        setError(null)
      } catch (err) {
        console.error('Image compression error:', err)
        setError('Gagal mengompres gambar.')
      }
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    let finalFotoPath = user.foto

    // Upload jika ada file
    if (fileToUpload) {
      const supabase = createClient()
      const ext = fileToUpload.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${ext}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileToUpload, { upsert: true })

      if (uploadError) {
        setError('Gagal mengunggah foto: ' + uploadError.message)
        setIsLoading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
      finalFotoPath = publicUrlData.publicUrl
    }

    if (finalFotoPath) {
      formData.set('foto', finalFotoPath)
    }

    const result = await updateProfile(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Profil berhasil diperbarui!')
      router.refresh()
    }
    
    setIsLoading(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await updatePassword(formData)

    if (result.error) {
      setPasswordError(result.error)
    } else {
      setPasswordSuccess('Kata sandi berhasil diperbarui!')
      // Reset form
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsPasswordLoading(false)
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Pengaturan Profil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900 font-heading">Pengaturan Profil</h2>
          <p className="text-sm text-gray-500 mt-1">Perbarui informasi diri dan foto profil Anda.</p>
        </div>
        
        <form onSubmit={handleProfileSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex gap-3 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl flex gap-3 text-sm border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-8">
            {/* Foto Profil Area */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {previewFoto ? (
                    <img src={previewFoto} alt="Foto Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Camera className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-xs text-gray-500 max-w-[150px] text-center">
                Maks. 5MB (Otomatis dikompres &lt; 500KB)
              </p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Username (Login)</label>
                <input
                  type="text"
                  value={user.username || ''}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Username tidak dapat diubah oleh pemilik akun.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap (Display Name)</label>
                <input
                  type="text"
                  name="nama"
                  defaultValue={user.nama || ''}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                <input
                  type="text"
                  name="nik"
                  defaultValue={user.nik || ''}
                  required
                  minLength={16}
                  maxLength={16}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  defaultValue={user.tanggal_lahir || ''}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Anggota (Opsional)</label>
                <input
                  type="text"
                  name="nomor_anggota"
                  defaultValue={user.nomor_anggota || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan</label>
                <input
                  type="text"
                  name="pendidikan"
                  defaultValue={user.pendidikan || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NPWP (Opsional)</label>
                <input
                  type="text"
                  name="npwp"
                  defaultValue={user.npwp || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periode (Opsional)</label>
                <input
                  type="text"
                  name="periode"
                  defaultValue={user.periode || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      {/* Ganti Password */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <Key className="w-5 h-5 text-gray-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-heading">Ganti Kata Sandi</h2>
            <p className="text-sm text-gray-500 mt-1">Pastikan kata sandi Anda kuat dan aman.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="p-6">
          {passwordError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex gap-3 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{passwordError}</p>
            </div>
          )}
          {passwordSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl flex gap-3 text-sm border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p>{passwordSuccess}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Kata Sandi Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirm_password"
                  required
                  placeholder="Ketik ulang kata sandi"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isPasswordLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/20 disabled:opacity-70 transition-all"
            >
              {isPasswordLoading ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
