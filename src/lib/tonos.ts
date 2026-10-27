// Color de cada estado. Siempre va con su texto: el color nunca informa solo.
import type { EstadoAprobacion, EstadoCheque, EstadoInscripcion, EstadoNovedad, EstadoPago } from '../types'

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

export const tonoAprobacion: Record<EstadoAprobacion, Tono> = {
  por_aprobar: 'alerta',
  vencida: 'peligro',
  aprobada: 'exito',
  aprobada_automatica: 'exito',
  rechazada: 'peligro',
}

export const tonoPago: Record<EstadoPago, Tono> = {
  pagada: 'exito',
  parcial: 'alerta',
  sin_pago: 'peligro',
  saldo_a_favor: 'info',
  ineficaz: 'peligro',
}

export const tonoCheque: Record<EstadoCheque, Tono> = {
  en_canje: 'alerta',
  pagado: 'exito',
  devuelto: 'peligro',
}
