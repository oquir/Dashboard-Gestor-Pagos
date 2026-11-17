import type { PdfDesign, PdfSheet } from '../../../../types'

export interface PdfSheetViewProps {
  sheet: PdfSheet
  design: PdfDesign
  index: number
  total: number
  isActive: boolean
  selectedIds: ReadonlySet<string>
  selectedBlockId: string | null
  // Clic en el papel (no en una celda ni en un bloque): esta hoja pasa a ser la activa.
  onActivate: () => void
  onSelectCell: (tableId: string, cellId: string, extend: boolean) => void
  onSelectBlock: (blockId: string) => void
}
