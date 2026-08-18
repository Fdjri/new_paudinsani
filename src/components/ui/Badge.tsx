import * as React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    // Generic Variants
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    // Domain Variants
    | 'aktif'
    | 'lulus'
    | 'keluar'
    | 'hadir'
    | 'sakit'
    | 'izin'
    | 'alpa'
    | 'lunas'
    | 'belum_lunas'
    | 'cicil'
    | 'pemasukan'
    | 'pengeluaran'
    | 'default'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    // Base styles
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border'

    // Variants according to docs/design.md
    const variants: Record<string, string> = {
      // Generic
      primary: 'bg-blue-100 text-blue-800 border-blue-200',
      secondary: 'bg-gray-100 text-gray-800 border-gray-200',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      danger: 'bg-red-50 text-red-700 border-red-200',
      warning: 'bg-amber-50 text-amber-700 border-amber-200',
      info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      
      // Domain
      aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      lulus: 'bg-blue-50 text-blue-700 border-blue-200',
      keluar: 'bg-red-50 text-red-700 border-red-200',
      hadir: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      sakit: 'bg-blue-50 text-blue-700 border-blue-100',
      izin: 'bg-amber-50 text-amber-700 border-amber-100',
      alpa: 'bg-red-50 text-red-700 border-red-100',
      lunas: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      belum_lunas: 'bg-red-50 text-red-700 border-red-100',
      cicil: 'bg-amber-50 text-amber-700 border-amber-100',
      pemasukan: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      pengeluaran: 'bg-red-50 text-red-700 border-red-100',
      default: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    const classes = `${baseStyles} ${variants[variant] || variants.default} ${className}`

    return (
      <span ref={ref} className={classes} {...props}>
        {props.children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
