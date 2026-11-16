import type { Declaration } from '../../../../types'

export interface DeclarationDataProps {
  d: Declaration
  corrected?: Declaration
  /** La corrección baja el valor a pagar o sube el saldo a favor de la que corrige. */
  downward?: boolean
}
