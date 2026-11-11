import type { CargaCalendario, Declaracion } from '../../../../types'

export interface AvisoSinCalendarioProps {
  d: Declaracion
  /** Cuándo cargó el municipio el calendario del año gravable, si ya lo cargó. */
  carga?: CargaCalendario
}
