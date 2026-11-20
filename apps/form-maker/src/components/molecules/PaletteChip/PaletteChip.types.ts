import type { FieldTypeDef } from '../../../types'

export interface PaletteChipProps {
  fieldType: FieldTypeDef
  onAdd: (fieldType: FieldTypeDef) => void
}
