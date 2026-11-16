import type { ReactNode } from 'react'
import type { RowData } from '@tanstack/react-table'
import type { Columns } from '../../../lib'

export interface TableProps<T extends RowData> {
  data: T[]
  /** Deben ser estables (módulo o useMemo), como pide TanStack Table. */
  columns: Columns<T>
  /** Sin valor, la tabla muestra todas las filas. */
  perPage?: number
  initialOrder?: { id: string; desc: boolean }[]
  /** Texto del pie, por ejemplo "inscripciones". */
  name?: string
  empty?: string
  dense?: boolean
  rowId?: (row: T) => string
  rowClass?: (row: T) => string
  /** Va al final del pie, a la derecha, por ejemplo la suma de una columna. */
  summary?: ReactNode
}
