import { COLUMNAS, SIN_APROBACION } from '../../../../lib'
import type { IdReporte } from '../../../../lib'
import { columnasTabla } from './TablaReporte.utils'

/** Columnas de la tabla de cada reporte, fijas como pide TanStack Table. */
export const TABLAS = Object.fromEntries(
  Object.entries(COLUMNAS).map(([id, c]) => [id, columnasTabla(c)]),
) as Record<IdReporte, ReturnType<typeof columnasTabla>>
export const TABLA_SIN_APROBACION = columnasTabla(SIN_APROBACION)
