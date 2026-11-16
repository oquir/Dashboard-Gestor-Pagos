import type { FileItem } from '../../../lib'

export interface FileListProps {
  title: string
  description?: string
  items: FileItem[]
  /** Líneas que identifican al contribuyente o la declaración en los archivos de muestra. */
  context: string[]
  /** Nombre del .zip que reúne todos los archivos cargados. */
  zipName: string
  empty?: string
}
