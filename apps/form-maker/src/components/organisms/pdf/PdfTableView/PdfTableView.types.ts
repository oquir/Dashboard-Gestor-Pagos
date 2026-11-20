import type { PdfFontFamily, PdfTable } from '../../../../types'

export interface PdfTableViewProps {
  table: PdfTable
  // El texto vertical sin fuente propia se dibuja con esta.
  fontFamily: PdfFontFamily
  selectedIds: ReadonlySet<string>
  onSelectCell: (tableId: string, cellId: string, extend: boolean) => void
}
