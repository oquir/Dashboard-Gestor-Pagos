import type { SituacionAprobacion } from '../../../../lib/reglas'
import type { Declaracion, EstadoAprobacion, ValorFiltro } from '../../../../types'

/** Una declaración con su aprobación previa. */
export interface DeclaracionConAprobacion {
  d: Declaracion
  a: SituacionAprobacion
}

/** Por estado de aprobación; `pendientes`, las que esperan aprobación, dentro o fuera del plazo. */
export type FiltroAprobaciones = ValorFiltro<EstadoAprobacion | 'pendientes'>

export interface AprobacionesPendientesProps {
  /** Lo pendiente primero, por plazo; lo resuelto, de lo más reciente a lo más antiguo. */
  aprobaciones: DeclaracionConAprobacion[]
  /** Nombre del declarante por id de inscripción. */
  nombres: Map<string, string>
  className?: string
}
