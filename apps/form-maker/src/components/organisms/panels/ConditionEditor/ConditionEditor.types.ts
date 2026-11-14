import type { CanvasField, ConditionKind } from '../../../../types'

export interface ConditionEditorProps {
  field: CanvasField
  otherFields: CanvasField[]
  kind: ConditionKind
}
