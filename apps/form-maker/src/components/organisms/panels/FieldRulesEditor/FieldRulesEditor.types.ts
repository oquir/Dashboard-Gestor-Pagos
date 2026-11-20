import type { CanvasField } from '../../../../types'

export interface FieldRulesEditorProps {
  field: CanvasField
  candidates: CanvasField[]
}

export interface RuleEffectSummary {
  id: string
  text: string
  isCode: boolean
}

export interface RuleSummary {
  id: string
  // null: sin nombre, la identifica su numero.
  label: string | null
  when: string
  effects: RuleEffectSummary[]
}
