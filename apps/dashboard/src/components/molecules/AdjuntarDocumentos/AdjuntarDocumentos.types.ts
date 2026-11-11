export interface AdjuntarDocumentosProps {
  etiqueta?: string
  /** Los elegidos, aún sin guardar: se guardan al enviar la respuesta. */
  archivos: File[]
  onChange: (archivos: File[]) => void
}
