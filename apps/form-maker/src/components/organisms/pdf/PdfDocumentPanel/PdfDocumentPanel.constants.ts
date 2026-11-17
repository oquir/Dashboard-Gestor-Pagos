import type { PdfMargins } from '../../../../types'

export const MARGIN_SIDES: { side: keyof PdfMargins; label: string }[] = [
  { side: 'top', label: 'Arriba' },
  { side: 'bottom', label: 'Abajo' },
  { side: 'left', label: 'Izquierda' },
  { side: 'right', label: 'Derecha' },
]
