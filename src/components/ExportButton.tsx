'use client'

import * as XLSX from 'xlsx'

type Ligne = Record<string, string | number | boolean | null>

export default function ExportButton({ data, filename, label }: { data: Ligne[]; filename: string; label: string }) {
  const exporter = () => {
    const feuille = XLSX.utils.json_to_sheet(data)
    const classeur = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(classeur, feuille, 'Données')
    XLSX.writeFile(classeur, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <button
      type="button"
      onClick={exporter}
      className="text-xs font-semibold uppercase tracking-wide bg-anareka-or text-white px-4 py-2 rounded-anareka hover:bg-anareka-or-clair transition-colors"
    >
      {label}
    </button>
  )
}
