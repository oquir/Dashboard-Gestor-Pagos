export interface PdfImageSourceFieldProps {
  id: string
  label: string
  src: string
  // El tamaño en que se muestra, para avisar si la imagen pesa mucho mas.
  display: { width?: number; height?: number }
  onChange: (src: string) => void
}
