import type { CanvasField } from '../../../types'

export interface LabelTargetSelectProps {
  value: string | undefined
  candidates: CanvasField[]
  onChange: (targetFieldId: string | null) => void
}
