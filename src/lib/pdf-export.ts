'use client'

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportPdf(
  filename: string,
  title: string,
  rows: Record<string, string | number | null | undefined>[]
) {
  if (rows.length === 0) return

  const doc = new jsPDF({ orientation: rows[0] && Object.keys(rows[0]).length > 6 ? 'landscape' : 'portrait' })
  doc.setFontSize(14)
  doc.text(title, 14, 16)

  const headers = Object.keys(rows[0])
  const body = rows.map((row) => headers.map((header) => String(row[header] ?? '')))

  autoTable(doc, {
    head: [headers],
    body,
    startY: 22,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}
