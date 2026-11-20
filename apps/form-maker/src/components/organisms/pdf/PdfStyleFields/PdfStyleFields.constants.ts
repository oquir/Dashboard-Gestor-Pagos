import type { PdfCellBorders, PdfTextAlign, PdfVerticalAlign } from '../../../../types'

export const HORIZONTAL_ALIGNS: { value: PdfTextAlign; label: string }[] = [
  { value: 'left', label: 'Izquierda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Derecha' },
]

export const VERTICAL_ALIGNS: { value: PdfVerticalAlign; label: string }[] = [
  { value: 'top', label: 'Arriba' },
  { value: 'middle', label: 'Medio' },
  { value: 'bottom', label: 'Abajo' },
]

export const BORDER_SIDES: { side: keyof PdfCellBorders; label: string }[] = [
  { side: 'top', label: 'Arriba' },
  { side: 'bottom', label: 'Abajo' },
  { side: 'left', label: 'Izq.' },
  { side: 'right', label: 'Der.' },
]

export const NO_BORDERS: PdfCellBorders = { top: false, right: false, bottom: false, left: false }

export const GROUP_CLASSES: string = 'flex flex-col gap-1.5'

export const GROUP_TITLE_CLASSES: string = 'text-[11px] font-medium text-fg-muted'
