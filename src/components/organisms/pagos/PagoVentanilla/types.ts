import type { Declaracion } from '../../../../types'

export interface PagoVentanillaProps {
  d: Declaracion
  /** Lo que falta por pagar, sin contar lo que está en cheques en canje. */
  saldo: number
  /** El municipio recibe cheques de gerencia. */
  cheque: boolean
  /** El cheque puede ser por menos del saldo. */
  chequeParcial: boolean
}

export type Medio = 'efectivo' | 'cheque'

/** El último pago registrado, para confirmarlo. */
export interface Registrado {
  medio: Medio
  valor: number
  recibo: string
  saldo: number
}
