'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Student, CircleNotch } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { login } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setPending(true)
    
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setPending(false)
    } else if (result?.success && result?.redirectTo) {
      router.push(result.redirectTo)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20 
        }}
        className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 space-y-8"
      >
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Student weight="duotone" className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-center text-2xl font-bold text-gray-900 font-heading">
            PAUD INSANI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistem Informasi Manajemen
          </p>
        </div>
        
        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email / Username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="w-full border-gray-300 bg-white rounded-2xl px-4 py-3 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="Masukkan email Anda"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full border-gray-300 bg-white rounded-2xl px-4 py-3 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={pending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {pending ? (
                <CircleNotch weight="bold" className="animate-spin h-5 w-5" />
              ) : (
                'Masuk'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
