import type { ExportedField } from '../../../../types'

export interface PreviewNumberInputProps {
  field: ExportedField
  value: unknown
  disabled: boolean
  inputId: string
  // Las arma PreviewFieldControl, que sabe si el campo esta en rojo.
  className: string
  onChange: (value: unknown) => void
}
