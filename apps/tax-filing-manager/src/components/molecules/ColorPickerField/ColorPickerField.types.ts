export interface ColorPickerFieldProps {
  value: string
  change: (hex: string) => void
  error?: string
}
