// Configuración común de TanStack Table (react-table v9) para todas las tablas.
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table'
import type { CellData, RowData, TableFeatures, useTable } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // La extensión debe repetir los parámetros de tipo de TanStack aunque no se usen.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<in out TFeatures extends TableFeatures, in out TData extends RowData, TValue extends CellData = CellData> {
    /** Alinea encabezado y celdas a la derecha (columnas de valores). */
    alinear?: 'derecha'
    /** Clases extra para las celdas de la columna. */
    clase?: string
  }
}

/** Funciones habilitadas en las tablas: ordenar y paginar en el cliente. */
export const caracteristicas = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime, text: sortFn_text },
})

export type Caracteristicas = typeof caracteristicas
export type Columnas<T extends RowData> = Parameters<typeof useTable<Caracteristicas, T>>[0]['columns']

export const ayudanteColumnas = <T extends RowData>() => createColumnHelper<Caracteristicas, T>()
