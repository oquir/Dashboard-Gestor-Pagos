import type { Municipio } from '../../../../types'

export interface AlertaCalendarioProps {
  /** El año en curso. */
  anio: number
  /** Los municipios que se están viendo y no han cargado el calendario de ese año. */
  municipios: Municipio[]
  className?: string
}
