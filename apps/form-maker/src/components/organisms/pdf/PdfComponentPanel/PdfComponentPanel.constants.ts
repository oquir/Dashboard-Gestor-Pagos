import type { PdfVerticalDirection } from '../../../../types'

export const DIRECTIONS: { value: PdfVerticalDirection; label: string }[] = [
  { value: 'up', label: 'De abajo arriba' },
  { value: 'down', label: 'De arriba abajo' },
]

// Una {variable} en un texto que sale como imagen: no se reemplaza nunca.
export const HAS_VARIABLE: RegExp = /\{[^{}\s]+\}/

export const DOCUMENT_FONT: string = ''
