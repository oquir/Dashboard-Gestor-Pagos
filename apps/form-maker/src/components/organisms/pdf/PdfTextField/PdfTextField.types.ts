export interface PdfTextFieldProps {
  id: string
  label: string
  value: string
  placeholder?: string
  // Varias lineas: un textarea, cada salto es un salto en el PDF.
  multiline?: boolean
  // Lo que va pegado a los lados del campo, como las llaves de una variable.
  prefix?: string
  suffix?: string
  onChange: (value: string) => void
}
