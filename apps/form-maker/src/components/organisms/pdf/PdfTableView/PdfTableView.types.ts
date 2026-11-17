import type { PdfTable } from '../../../../types'

export interface PdfTableViewProps {
  table: PdfTable
  selectedIds: ReadonlySet<string>
  onSelectCell: (tableId: string, cellId: string, extend: boolean) => void
}
