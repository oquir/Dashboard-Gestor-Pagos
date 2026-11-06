import type { Novedad } from '../../../../types'

export interface EncabezadoSolicitudProps {
  solicitud: Novedad
  /** Se compara con la solicitud aprobada anterior. */
  comparada: boolean
  verActuales: () => void
  /** En una inscripción radicada después del plazo: cuándo vencía y cuántos días tarde llegó. */
  tardia?: { limite: string; dias: number } | null
}
