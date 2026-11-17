export interface PdfNumberFieldProps {
  id: string
  label: string
  value: number | undefined
  placeholder?: string
  suffix?: string
  min?: number
  max?: number
  step?: number
  onChange: (value: number | undefined) => void
}
