// Color de cada estado. Siempre va con su texto: el color nunca informa solo.
import type { EstadoInscripcion, EstadoNovedad, EstadoPago, EstadoRevision } from '../types'

export type Tono = 'neutral' | 'info' | 'exito' | 'alerta' | 'peligro'

export const tonoInscripcion: Record<EstadoInscripcion, Tono> = {
  en_revision: 'alerta',
  activa: 'exito',
  rechazada: 'peligro',
  cancelada: 'neutral',
}

export const tonoNovedad: Record<EstadoNovedad, Tono> = {
  pendiente: 'alerta',
  aprobada: 'exito',
  rechazada: 'peligro',
}

export const tonoRevision: Record<EstadoRevision, Tono> = {
  pendiente: 'alerta',
  revisada: 'exito',
  con_observaciones: 'info',
}

export const tonoPago: Record<EstadoPago, Tono> = {
  pagada: 'exito',
  parcial: 'alerta',
  sin_pago: 'peligro',
  saldo_a_favor: 'info',
  ineficaz: 'peligro',
}
