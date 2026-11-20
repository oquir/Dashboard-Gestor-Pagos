import type { FieldTypeDef } from '../../../types'

export interface PaletteChipProps {
  fieldType: FieldTypeDef
  // El clic agrega el campo al final del paso activo; arrastrar lo suelta donde se quiera.
  onAdd: (fieldType: FieldTypeDef) => void
}
