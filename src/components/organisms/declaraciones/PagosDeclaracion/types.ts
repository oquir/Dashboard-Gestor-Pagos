import type { Cheque, Declaracion, Pago } from '../../../../types'

export interface PagosDeclaracionProps {
  d: Declaracion
  pagos: Pago[]
  cheques: Cheque[]
}
