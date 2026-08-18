'use client'

import * as React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface SiswaData {
  kelas: string
  aktif: number
  total: number
}

interface SiswaBarChartProps {
  data: SiswaData[]
}

export function SiswaBarChart({ data }: SiswaBarChartProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold font-heading text-gray-900">Distribusi Siswa per Kelas</h3>
        <p className="text-sm text-gray-500">Perbandingan siswa aktif vs total terdaftar</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="kelas" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              dx={-10}
            />
            <Tooltip 
              cursor={{ fill: '#f9fafb' }}
              labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar 
              name="Siswa Aktif" 
              dataKey="aktif" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
            <Bar 
              name="Total Terdaftar" 
              dataKey="total" 
              fill="#93c5fd" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
