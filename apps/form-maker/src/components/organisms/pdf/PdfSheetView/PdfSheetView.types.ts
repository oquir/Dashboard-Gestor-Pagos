import type { PdfDesign, PdfSheet } from '../../../../types'

// Cuantos px se sale el contenido de la hoja por abajo y por la derecha (0 si cabe).
export interface SheetOverflow {
  bottom: number
  right: number
}

export interface PdfSheetViewProps {
  sheet: PdfSheet
  design: PdfDesign
  index: number
  total: number
  isActive: boolean
  zoom: number
  selectedIds: ReadonlySet<string>
  selectedBlockId: string | null
  // Clic en el papel (no en una celda ni en un bloque): esta hoja pasa a ser la activa.
  onActivate: () => void
  onSelectCell: (tableId: string, cellId: string, extend: boolean) => void
  onSelectBlock: (blockId: string) => void
}
