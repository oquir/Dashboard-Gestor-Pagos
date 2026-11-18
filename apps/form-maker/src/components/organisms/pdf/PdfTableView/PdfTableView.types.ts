import type { PdfFontFamily, PdfTable } from '../../../../types'

export interface PdfTableViewProps {
  table: PdfTable
  // La fuente del documento: el texto vertical sin fuente propia se dibuja con ella.
  fontFamily: PdfFontFamily
  selectedIds: ReadonlySet<string>
  onSelectCell: (tableId: string, cellId: string, extend: boolean) => void
}
