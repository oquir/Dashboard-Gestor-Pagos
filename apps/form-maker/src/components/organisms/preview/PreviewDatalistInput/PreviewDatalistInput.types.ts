export interface PreviewDatalistInputProps {
  inputId: string
  // Ya limpias desde el export.
  suggestions: string[]
  value: string
  placeholder: string | undefined
  maxLength: number | undefined
  disabled: boolean
  // Las arma PreviewFieldControl, que sabe si el campo esta en rojo.
  className: string
  onChange: (value: string) => void
}
