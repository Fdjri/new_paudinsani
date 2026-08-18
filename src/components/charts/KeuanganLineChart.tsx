'use client'

import * as React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useRouter } from 'next/navigation'

interface KeuanganData {
  bulan: string
  pemasukan: number
  pengeluaran: number
}

interface KeuanganLineChartProps {
  data: KeuanganData[]
  years: number[]
  selectedYear: number
  basePath: string
}

export function KeuanganLineChart({ data, years, selectedYear, basePath }: KeuanganLineChartProps) {
  const router = useRouter()

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value)
  }

  const formatRupiahTooltip = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold font-heading text-gray-900">Tren Keuangan</h3>
          <p className="text-sm text-gray-500">Pemasukan vs Pengeluaran per bulan</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => router.push(`${basePath}?year=${e.target.value}`)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-9 px-3 border bg-white"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              tickFormatter={formatRupiah} 
              dx={-10}
            />
            <Tooltip 
              formatter={(value: any) => [formatRupiahTooltip(Number(value) || 0), '']}
              labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line 
              type="monotone" 
              name="Pemasukan"
              dataKey="pemasukan" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              name="Pengeluaran"
              dataKey="pengeluaran" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
