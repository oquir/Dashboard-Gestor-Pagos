import type { CanvasField, FieldCondition } from '../../../types'

export interface ConditionFieldSelectProps {
  label: string
  condition: FieldCondition
  otherFields: CanvasField[]
  observedIsDead: boolean
  onChange: (fieldId: string) => void
}
