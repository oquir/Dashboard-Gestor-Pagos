import type { RowData } from '@tanstack/react-table'
import type { Columnas } from '../../../lib/tabla'

export interface TablaProps<T extends RowData> {
  datos: T[]
  /** Deben ser estables (módulo o useMemo), como pide TanStack Table. */
  columnas: Columnas<T>
  /** Sin valor, la tabla muestra todas las filas. */
  porPagina?: number
  ordenInicial?: { id: string; desc: boolean }[]
  /** Texto del pie, por ejemplo "inscripciones". */
  nombre?: string
  vacio?: string
  densa?: boolean
  idFila?: (fila: T) => string
  claseFila?: (fila: T) => string
}
