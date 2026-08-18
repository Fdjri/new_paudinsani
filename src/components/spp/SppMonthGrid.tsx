'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CaretLeft, CaretRight, Calendar as CalendarIcon } from '@phosphor-icons/react'

interface SppMonthGridProps {
  basePath: string
  initialYear: number
}

const MONTHS = [
  { id: 1, name: 'Januari' },
  { id: 2, name: 'Februari' },
  { id: 3, name: 'Maret' },
  { id: 4, name: 'April' },
  { id: 5, name: 'Mei' },
  { id: 6, name: 'Juni' },
  { id: 7, name: 'Juli' },
  { id: 8, name: 'Agustus' },
  { id: 9, name: 'September' },
  { id: 10, name: 'Oktober' },
  { id: 11, name: 'November' },
  { id: 12, name: 'Desember' }
]

export function SppMonthGrid({ basePath, initialYear }: SppMonthGridProps) {
  const router = useRouter()
  const [year, setYear] = React.useState(initialYear)

  const handleMonthClick = (month: number) => {
    router.push(`${basePath}/${year}/${month}`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            Tahun Ajaran {year}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Pilih bulan untuk melihat atau mengelola pembayaran SPP.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <button 
              onClick={() => setYear(y => y - 1)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200 transition-colors"
            >
              <CaretLeft weight="bold" className="w-5 h-5" />
            </button>
            <div className="px-4 font-semibold text-gray-900 min-w-[80px] text-center">
              {year}
            </div>
            <button 
              onClick={() => setYear(y => y + 1)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l border-gray-200 transition-colors"
            >
              <CaretRight weight="bold" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-6 bg-gray-50/50">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MONTHS.map((month) => {
            // Note: We can expand this later to show summary stats (e.g., % Lunas)
            return (
              <button
                key={month.id}
                onClick={() => handleMonthClick(month.id)}
                className="group relative bg-white border border-gray-200 rounded-xl p-5 flex flex-col text-left hover:border-blue-500 hover:shadow-md transition-all duration-200"
              >
                <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {month.name}
                </div>
                <div className="mt-2 text-sm text-gray-500 font-medium">
                  Klik untuk kelola
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
