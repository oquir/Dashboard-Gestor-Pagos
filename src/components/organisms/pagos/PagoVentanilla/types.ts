import type { Declaracion, MediosVentanilla } from '../../../../types'

export interface PagoVentanillaProps {
  d: Declaracion
  /** Lo que falta por pagar, sin contar lo que está en cheques en canje. */
  saldo: number
  /** Lo que el municipio recibe en su ventanilla para este formulario. */
  medios: MediosVentanilla
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
