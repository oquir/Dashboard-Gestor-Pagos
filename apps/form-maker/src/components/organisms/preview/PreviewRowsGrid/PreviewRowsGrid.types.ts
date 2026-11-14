import type { ExportedRow } from '../../../../types'
import type { FormPreviewApi } from '../../../../types'
import type { RuntimeScope } from '../../../../types'

export interface PreviewRowsGridProps {
  rows: ExportedRow[]
  scope: RuntimeScope
  preview: FormPreviewApi
  groupId?: string
  itemIndex?: number
}
