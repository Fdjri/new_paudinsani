'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CaretLeft, CaretRight, Info } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { PublicHoliday } from '@/lib/holidays'

interface CalendarProps {
  basePath: string
  holidays: PublicHoliday[]
}

export function Calendar({ basePath, holidays }: CalendarProps) {
  const router = useRouter()
  
  // Use current date as initial state
  const [currentDate, setCurrentDate] = React.useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Helpers to get days in month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay() // 0 = Sunday, 1 = Monday

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Navigate months
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const today = () => setCurrentDate(new Date())

  // Formatting helpers
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const formatIsoDate = (d: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  const isWeekend = (d: number) => {
    const day = new Date(year, month, d).getDay()
    return day === 0 || day === 6
  }

  const getHoliday = (d: number) => {
    const dateStr = formatIsoDate(d)
    return holidays.find(h => h.date === dateStr)
  }

  const handleDateClick = (d: number) => {
    if (isWeekend(d) || getHoliday(d)) return // Block weekend & holidays
    const dateStr = formatIsoDate(d)
    router.push(`${basePath}/${dateStr}`)
  }

  // Generate grid cells
  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const allCells = [...blanks, ...days]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Pilih tanggal untuk mengisi atau melihat absensi.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={today} className="hidden sm:block">Hari Ini</Button>
          <div className="flex items-center rounded-md border border-gray-200 bg-white">
            <button onClick={prevMonth} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200 rounded-l-md">
              <CaretLeft weight="bold" className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-r-md">
              <CaretRight weight="bold" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-4 text-xs font-medium text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-white border border-gray-200"></div>
          <span>Hari Efektif</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
          <span>Akhir Pekan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-50 border border-red-200"></div>
          <span>Libur Nasional</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-px mb-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div>Min</div>
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div>Sab</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {allCells.map((day, index) => {
            if (day === null) {
              return <div key={`blank-${index}`} className="aspect-square" />
            }

            const weekend = isWeekend(day)
            const holiday = getHoliday(day)
            const blocked = weekend || !!holiday
            
            // Check if it's today
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

            let btnClasses = 'w-full aspect-square flex flex-col items-center justify-center rounded-xl border relative transition-all '
            
            if (holiday) {
              btnClasses += 'bg-red-50/50 border-red-100 text-red-600 cursor-not-allowed '
            } else if (weekend) {
              btnClasses += 'bg-gray-50/50 border-gray-100 text-gray-400 cursor-not-allowed '
            } else {
              btnClasses += 'bg-white border-gray-200 text-gray-900 hover:border-blue-500 hover:shadow-md cursor-pointer '
            }

            if (isToday && !blocked) {
              btnClasses += 'ring-2 ring-blue-500 ring-offset-2 '
            }

            return (
              <button 
                key={`day-${day}`}
                className={btnClasses}
                onClick={() => handleDateClick(day)}
                disabled={blocked}
                title={holiday ? holiday.name : weekend ? 'Akhir Pekan' : `Isi absensi tanggal ${day}`}
              >
                <span className={`text-lg font-bold ${holiday ? 'text-red-700' : weekend ? 'text-gray-500' : 'text-gray-900'}`}>
                  {day}
                </span>
                
                {holiday && (
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                    <Info className="w-3 h-3 text-red-400" />
                  </div>
                )}
                
                {/* On larger screens, show truncated holiday name */}
                {holiday && (
                  <span className="hidden sm:block absolute bottom-2 w-[90%] px-1 text-[9px] leading-tight font-medium text-red-600 bg-red-100/50 rounded-sm truncate text-center">
                    {holiday.localName}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
