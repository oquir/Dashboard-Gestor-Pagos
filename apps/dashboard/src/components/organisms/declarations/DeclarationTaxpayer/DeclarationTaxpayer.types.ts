import type { Declaration, Registration } from '../../../../types'

export interface DeclarationTaxpayerProps {
  d: Declaration
  /** Su inscripción en el RIT, si el municipio tiene el RIT en el aplicativo y el contribuyente está inscrito. */
  reg?: Registration
  /** El municipio tiene el RIT en el aplicativo, pero el contribuyente no está inscrito. */
  unregistered?: boolean
  /** Va en la columna ancha, con los datos en varias columnas. */
  wide?: boolean
}
