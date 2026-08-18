import * as React from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col min-w-[240px]">
      <div className="flex items-center gap-3 text-gray-500 mb-2">
        <div className="text-blue-600 bg-blue-50 p-2 rounded-lg">
          {icon}
        </div>
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      
      <div className="text-3xl font-bold font-heading text-gray-900 my-2">
        {value}
      </div>
      
      {trend && (
        <div className="flex items-center gap-1.5 mt-auto">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {trend.isPositive ? '▲' : '▼'} {trend.value}
          </span>
          <span className="text-xs text-gray-500">dari bulan lalu</span>
        </div>
      )}
    </div>
  )
}
