import type { Declaration, TellerMethods } from '../../../../types'

export interface TellerPaymentProps {
  d: Declaration
  /** Lo que falta por pagar, sin contar lo que está en cheques en canje. */
  balance: number
  /** Lo que el municipio recibe en su ventanilla para este formulario. */
  methods: TellerMethods
  /** El cheque puede ser por menos del saldo. */
  partialCheck: boolean
}

export type Method = 'cash' | 'check'

/** El último pago registrado, para confirmarlo. */
export interface Recorded {
  method: Method
  value: number
  receipt: string
  balance: number
}
