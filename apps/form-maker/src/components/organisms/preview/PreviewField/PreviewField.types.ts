import type { CatalogBank } from '../../../../types'
import type { ExportedField, ExportedTooltip } from '../../../../types'
import type { RuntimeScope } from '../../../../types'

export interface PreviewFieldProps {
  field: ExportedField
  scope: RuntimeScope
  catalogBank: CatalogBank
  externalLabel: string | undefined
  linkedTooltip: ExportedTooltip | undefined
  error: string | undefined
  onChange: (value: unknown) => void
}
