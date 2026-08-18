'use client'

import { useEffect } from 'react'
import { Warning as AlertTriangle, ArrowsClockwise as RefreshCcw } from '@phosphor-icons/react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="p-4 bg-red-100 rounded-full text-red-600 mb-2">
        <AlertTriangle weight="duotone" className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold font-heading text-gray-900">Oops! Terjadi Kesalahan</h2>
      <p className="text-gray-500 max-w-md">
        Sistem gagal memuat halaman ini. Ini mungkin masalah sementara pada server atau jaringan Anda.
      </p>
      
      <div className="pt-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          <RefreshCcw weight="bold" className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
      
      {/* Dev only error trace */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-w-2xl text-xs text-gray-600">
          <p className="font-bold mb-1">{error.message}</p>
          <pre>{error.stack}</pre>
        </div>
      )}
    </div>
  )
}
