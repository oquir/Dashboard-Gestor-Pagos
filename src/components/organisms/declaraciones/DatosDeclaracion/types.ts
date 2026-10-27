import type { Declaracion, Inscripcion } from '../../../../types'

export interface DatosDeclaracionProps {
  d: Declaracion
  ins?: Inscripcion
  corregida?: Declaracion
  /** El declarante lleva a su ficha del RIT, si el municipio lo tiene en el aplicativo. */
  enlazarRit: boolean
}
