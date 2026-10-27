import type { Fila, Reporte } from '../../../../lib/reportes'

export interface TablaReporteProps {
  reporte: Reporte
  filas: Fila[]
  /** Sin declaraciones con aprobación previa, el reporte de declaraciones va sin esa columna. */
  sinAprobacion: boolean
  desde: string
  hasta: string
  rangoInvalido: boolean
}
