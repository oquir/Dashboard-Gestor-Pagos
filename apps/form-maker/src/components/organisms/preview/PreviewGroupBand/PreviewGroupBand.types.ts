import type { ExportedRow } from '../../../../types'
import type { FormPreviewApi } from '../../../../types'

export interface PreviewGroupBandProps {
  groupId: string
  rows: ExportedRow[]
  preview: FormPreviewApi
}
