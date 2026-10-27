import type { SituacionAprobacion } from '../lib/reglas'
import type { Declaracion, EstadoPago } from './dominio'

/** Fila de la tabla de declaraciones. */
export interface FilaDeclaracion {
  d: Declaracion
  nombre: string
  /** NIT o cédula del declarante, con su tipo. */
  documento: string
  pago: EstadoPago
  /** Radicado de la declaración que corrige, si es una corrección. */
  corrige?: string
  aprobacion?: SituacionAprobacion
}
