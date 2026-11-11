import type { CanvasField, FieldValidationOverride } from '../../../types'

export interface ValidationOverrideCardProps {
  field: CanvasField
  override: FieldValidationOverride
  candidates: CanvasField[]
  position: number
}
