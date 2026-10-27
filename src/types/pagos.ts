import type { Declaracion, EstadoPago, Pago } from './dominio'

/** Declaración con deuda, para las listas de Inicio. */
export interface Deuda {
  d: Declaracion
  estado: EstadoPago
  pagado: number
}

/** Fila de la cartera pendiente. */
export interface FilaCartera {
  d: Declaracion
  estado: EstadoPago
  pagado: number
  nombre: string
}

/** Fila de los pagos recibidos. */
export interface FilaPago {
  p: Pago
  d: Declaracion
  nombre: string
}
