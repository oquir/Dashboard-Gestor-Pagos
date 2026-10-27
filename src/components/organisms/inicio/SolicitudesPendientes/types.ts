import type { Inscripcion, Novedad } from '../../../../types'

/** Una solicitud del RIT con el inscrito que la radicó. */
export interface SolicitudPendiente {
  ins: Inscripcion
  novedad: Novedad
}

export interface SolicitudesPendientesProps {
  /** De la más reciente a la más antigua. */
  pendientes: SolicitudPendiente[]
  className?: string
}
