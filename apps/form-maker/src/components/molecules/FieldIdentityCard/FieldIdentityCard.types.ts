import type { CanvasField } from '../../../types'

export interface FieldIdentityCardProps {
  field: CanvasField
  // La etiqueta externa que aporta el texto visible, si la hay.
  linkedLabel: CanvasField | null
}
