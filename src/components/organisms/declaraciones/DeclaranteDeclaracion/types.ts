import type { Declaracion, Inscripcion } from '../../../../types'

export interface DeclaranteDeclaracionProps {
  d: Declaracion
  /** Su inscripción en el RIT, si el municipio tiene el RIT en el aplicativo y él está inscrito. */
  ins?: Inscripcion
}
