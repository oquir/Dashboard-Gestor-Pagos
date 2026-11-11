import type { Declaracion, Inscripcion } from '../../../../types'

export interface ContribuyenteDeclaracionProps {
  d: Declaracion
  /** Su inscripción en el RIT, si el municipio tiene el RIT en el aplicativo y el contribuyente está inscrito. */
  ins?: Inscripcion
  /** El municipio tiene el RIT en el aplicativo, pero el contribuyente no está inscrito. */
  noInscrito?: boolean
  /** Va en la columna ancha, con los datos en varias columnas. */
  ancha?: boolean
}
