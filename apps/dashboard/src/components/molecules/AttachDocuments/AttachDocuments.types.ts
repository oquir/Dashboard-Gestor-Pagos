export interface AttachDocumentsProps {
  label?: string
  /** Los elegidos, aún sin guardar: se guardan al enviar la respuesta. */
  files: File[]
  onChange: (files: File[]) => void
}
