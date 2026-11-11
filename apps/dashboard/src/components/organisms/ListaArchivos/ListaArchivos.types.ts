import type { ItemArchivo } from '../../../lib'

export interface ListaArchivosProps {
  titulo: string
  descripcion?: string
  items: ItemArchivo[]
  /** Líneas que identifican al contribuyente o la declaración en los archivos de muestra. */
  contexto: string[]
  /** Nombre del .zip que reúne todos los archivos cargados. */
  nombreZip: string
  vacio?: string
}
