import { COLUMNS, NO_APPROVAL } from '../../../../lib'
import type { ReportId } from '../../../../lib'
import { tableColumns } from './ReportTable.utils'

/** Columnas de la tabla de cada reporte, fijas como pide TanStack Table. */
export const TABLES = Object.fromEntries(
  Object.entries(COLUMNS).map(([id, c]) => [id, tableColumns(c)]),
) as Record<ReportId, ReturnType<typeof tableColumns>>
export const NO_APPROVAL_TABLE = tableColumns(NO_APPROVAL)
