import type {
  PdfCellBorders,
  PdfCellContentKind,
  PdfTextAlign,
  PdfVerticalAlign,
} from '../../../../types'

export const CONTENT_KINDS: { kind: PdfCellContentKind; label: string }[] = [
  { kind: 'text', label: 'Texto' },
  { kind: 'html', label: 'HTML' },
  { kind: 'table', label: 'Tabla' },
  { kind: 'component', label: 'Componente' },
]

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
