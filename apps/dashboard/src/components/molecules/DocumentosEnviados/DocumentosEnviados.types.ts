import type { Archivo } from '../../../types'

export interface DocumentosEnviadosProps {
  documentos: Archivo[]
  /** Título y líneas del PDF de muestra que se descarga cuando el archivo no tiene contenido. */
  titulo: string
  contexto: string[]
  className?: string
}
