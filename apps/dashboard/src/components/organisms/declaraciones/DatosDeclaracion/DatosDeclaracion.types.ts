import type { Declaracion } from '../../../../types'

export interface DatosDeclaracionProps {
  d: Declaracion
  corregida?: Declaracion
  /** La corrección baja el valor a pagar o sube el saldo a favor de la que corrige. */
  aLaBaja?: boolean
}
