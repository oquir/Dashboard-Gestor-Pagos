import type { Declaracion, Pago } from '../../../../types'

export interface PagosDeclaracionProps {
  d: Declaracion
  pagos: Pago[]
}
