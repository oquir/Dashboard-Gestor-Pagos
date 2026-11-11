import type { ExportedRow, ExportedStep } from '../../../../types'
import type { FormPreviewApi } from '../../../../types'

export interface PreviewStepProps {
  step: ExportedStep
  preview: FormPreviewApi
}

export type PreviewBlock =
  { kind: 'rows'; rows: ExportedRow[] } | { kind: 'group'; groupId: string; rows: ExportedRow[] }
