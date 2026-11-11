import type { StoredFile } from '../../../types'

export interface SentDocumentsProps {
  documents: StoredFile[]
  /** Título y líneas del PDF de muestra que se descarga cuando el archivo no tiene contenido. */
  title: string
  context: string[]
  className?: string
}
