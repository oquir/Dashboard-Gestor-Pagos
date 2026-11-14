import type { CanvasField, FieldCondition } from '../../../types'

export interface ConditionValueInputProps {
  condition: FieldCondition
  observedField: CanvasField | null | undefined
  onChange: (value: FieldCondition['value']) => void
}
