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
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData = CellData,
  > {
    /* eslint-enable @typescript-eslint/no-unused-vars */
    /** Alinea encabezado y celdas a la derecha (columnas de valores). */
    align?: 'right'
    /** Clases extra para las celdas de la columna. */
    classes?: string
  }
}

/** Funciones habilitadas en las tablas: ordenar y paginar en el cliente. */
export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
})

export type Features = typeof features
export type Columns<T extends RowData> = Parameters<typeof useTable<Features, T>>[0]['columns']

export const columnHelper = <T extends RowData>() => createColumnHelper<Features, T>()
