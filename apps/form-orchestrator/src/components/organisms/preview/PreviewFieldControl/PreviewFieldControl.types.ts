import type { CatalogBank } from '../../../../types'
import type { ExportedField } from '../../../../types'
import type { RuntimeValues } from '../../../../types'

export interface PreviewFieldControlProps {
  field: ExportedField
  value: unknown
  disabled: boolean
  invalid: boolean
  // Un catalogo con dependsOn se consulta con el valor del campo padre.
  scopeValues: RuntimeValues
  catalogBank: CatalogBank
  onChange: (value: unknown) => void
}
