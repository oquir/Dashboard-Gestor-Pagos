import type { DataRow, Report } from '../../../../lib'

export interface ReportTableProps {
  report: Report
  rows: DataRow[]
  /** Sin declaraciones con aprobación previa, el reporte de declaraciones va sin esa columna. */
  withoutApproval: boolean
  from: string
  to: string
  invalidRange: boolean
}
