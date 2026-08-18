import * as XLSX from 'xlsx'

export interface KeuanganExportData {
  tanggal: string
  deskripsi: string
  tipe: 'pemasukan' | 'pengeluaran'
  jumlah: number
  biaya_satuan: number
  total: number
}

export function exportKeuanganToExcel(data: KeuanganExportData[], fileName: string) {
  // Hitung total
  const totalPemasukan = data
    .filter(d => d.tipe === 'pemasukan')
    .reduce((sum, d) => sum + d.total, 0)
    
  const totalPengeluaran = data
    .filter(d => d.tipe === 'pengeluaran')
    .reduce((sum, d) => sum + d.total, 0)
    
  const saldoDana = totalPemasukan - totalPengeluaran

  // Format data for sheet
  const rows = data.map((d, index) => ({
    'No': index + 1,
    'Tanggal': new Date(d.tanggal).toLocaleDateString('id-ID'),
    'Deskripsi': d.deskripsi,
    'Tipe': d.tipe === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
    'Jumlah': d.jumlah,
    'Biaya Satuan': d.biaya_satuan,
    'Total': d.tipe === 'pengeluaran' ? -Math.abs(d.total) : d.total
  }))

  // Add blank row
  rows.push({
    'No': '' as any,
    'Tanggal': '',
    'Deskripsi': '',
    'Tipe': '',
    'Jumlah': '' as any,
    'Biaya Satuan': '' as any,
    'Total': '' as any
  })

  // Add summary rows
  rows.push({
    'No': '' as any,
    'Tanggal': '',
    'Deskripsi': 'TOTAL PEMASUKAN',
    'Tipe': '',
    'Jumlah': '' as any,
    'Biaya Satuan': '' as any,
    'Total': totalPemasukan
  })
  
  rows.push({
    'No': '' as any,
    'Tanggal': '',
    'Deskripsi': 'TOTAL PENGELUARAN',
    'Tipe': '',
    'Jumlah': '' as any,
    'Biaya Satuan': '' as any,
    'Total': -Math.abs(totalPengeluaran)
  })

  rows.push({
    'No': '' as any,
    'Tanggal': '',
    'Deskripsi': 'SALDO DANA',
    'Tipe': '',
    'Jumlah': '' as any,
    'Biaya Satuan': '' as any,
    'Total': saldoDana
  })

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(rows)

  // Style the worksheet columns width
  const wscols = [
    { wch: 5 },  // No
    { wch: 12 }, // Tanggal
    { wch: 35 }, // Deskripsi
    { wch: 15 }, // Tipe
    { wch: 8 },  // Jumlah
    { wch: 15 }, // Biaya Satuan
    { wch: 15 }, // Total
  ]
  ws['!cols'] = wscols

  // Create workbook and append worksheet
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan')

  // Save file
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}
