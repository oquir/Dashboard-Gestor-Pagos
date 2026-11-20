import type { CanvasField, FieldOption } from '../../../types/field'

export interface FieldPreviewControlProps {
  field: CanvasField
}

// Por que no se ven las opciones propias: vienen del catalogo o todavia no hay.
export type OptionsNote = 'catalog' | 'empty'

// Sin opciones propias van dos de muestra y una nota que dice por que.
export interface PreviewOptions {
  items: FieldOption[]
  isPlaceholder: boolean
  note: OptionsNote | null
}
