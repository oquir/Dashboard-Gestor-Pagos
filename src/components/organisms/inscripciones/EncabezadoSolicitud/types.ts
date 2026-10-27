import type { Novedad } from '../../../../types'

export interface EncabezadoSolicitudProps {
  solicitud: Novedad
  /** Se compara con la solicitud aprobada anterior. */
  comparada: boolean
  verActuales: () => void
}
