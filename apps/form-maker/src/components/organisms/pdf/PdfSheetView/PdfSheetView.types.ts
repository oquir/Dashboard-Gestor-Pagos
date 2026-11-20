import type { PdfDesign, PdfSheet } from '../../../../types'

// Px que se sale el contenido por abajo y por la derecha (0 si cabe).
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
  // Clic en el papel (no en una celda ni en un bloque): activa la hoja.
  onActivate: () => void
  onSelectCell: (tableId: string, cellId: string, extend: boolean) => void
  onSelectBlock: (blockId: string) => void
}
