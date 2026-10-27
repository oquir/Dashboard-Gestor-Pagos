import type { Declaracion } from '../../../../types'

export interface PagoVentanillaProps {
  d: Declaracion
  saldo: number
}

/** El último pago registrado, para confirmarlo. */
export interface Registrado {
  valor: number
  recibo: string
  saldo: number
}
