'use client'

import * as XLSX from 'xlsx'

interface ExportButtonProps {
  data: any[]
  filename: string
  label: string
}

export default function ExportButton({ data, filename, label }: ExportButtonProps) {
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Données')
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <button
      onClick={handleExport}
      className="text-xs font-semibold uppercase tracking-wide bg-anareka-or text-white px-4 py-2 rounded-anareka hover:bg-anareka-or-clair transition-colors"
    >
      {label}
    </button>
  )
}
