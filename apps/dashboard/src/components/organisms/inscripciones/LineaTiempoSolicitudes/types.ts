import type { ConfigMunicipio, Inscripcion, Novedad } from '../../../../types'

export interface LineaTiempoSolicitudesProps {
  inscripcion: Inscripcion
  /** La que se está viendo; sin ella, los datos actuales. */
  solicitud?: Novedad
  elegir: (novedadId: string | null) => void
  config?: ConfigMunicipio
  puedeRevisar: boolean
}
