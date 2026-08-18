import * as React from 'react'

export interface Column {
  key: string
  label: string
  className?: string
}

export interface DataTableProps {
  columns: Column[]
  children: React.ReactNode // rows
  toolbar?: React.ReactNode // search, filters
  pagination?: React.ReactNode
  isEmpty?: boolean
  emptyMessage?: string
}

export function DataTable({
  columns,
  children,
  toolbar,
  pagination,
  isEmpty = false,
  emptyMessage = 'Tidak ada data',
}: DataTableProps) {
  return (
    <div className="w-full bg-card rounded-[24px] shadow-sm border border-border overflow-hidden transition-all duration-300">
      {/* Toolbar */}
      {toolbar && (
        <div className="p-5 border-b border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {toolbar}
        </div>
      )}

      {/* Table Wrapper for horizontal scroll on small devices */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-card-foreground">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold tracking-wider">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`px-5 py-4 ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="p-4 border-t border-border bg-card flex items-center justify-center sm:justify-end">
          {pagination}
        </div>
      )}
    </div>
  )
}
