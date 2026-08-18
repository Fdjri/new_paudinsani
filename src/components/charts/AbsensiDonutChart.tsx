'use client'

import * as React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface AbsensiData {
  name: string
  value: number
}

interface AbsensiDonutChartProps {
  data: AbsensiData[]
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']

export function AbsensiDonutChart({ data }: AbsensiDonutChartProps) {
  // Hitung total untuk persentase custom (opsional)
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  // Custom label untuk PieChart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    if (percent === 0) return null;
    
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold font-heading text-gray-900">Ringkasan Absensi</h3>
        <p className="text-sm text-gray-500">Persentase kehadiran bulan ini</p>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        {total === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Belum ada data absensi
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={90}
                innerRadius={45} // Membuatnya jadi Donut Chart
                fill="#8884d8"
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#374151', fontWeight: 600 }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
