import type { EstadoNovedad, Novedad } from '../../../../types'

/** Cómo se resuelve la solicitud. */
export type Respuesta = Exclude<EstadoNovedad, 'pendiente'>

export interface RespuestaSolicitudProps {
  inscripcionId: string
  novedad: Novedad
  correo: string
}
