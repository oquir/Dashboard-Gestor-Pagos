// Color de cada estado. Siempre va con su texto: el color nunca informa solo.
import type { EstadoAprobacion, EstadoCheque, EstadoCorreccion, EstadoEmplazamiento, EstadoInscripcion, EstadoNovedad, EstadoPago } from '../types'

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

export const tonoCorreccion: Record<EstadoCorreccion, Tono> = {
  por_resolver: 'alerta',
  aceptada: 'exito',
  aceptada_por_silencio: 'exito',
  rechazada: 'peligro',
}

/** El de declarar vencido es grave: siguen la sanción por no declarar y el aforo. El de corregir sin respuesta, no: no genera sanción. */
export const tonoEmplazamiento: Record<EstadoEmplazamiento, Tono> = {
  en_plazo: 'alerta',
  vencido: 'peligro',
  declarado: 'exito',
  sin_respuesta: 'neutral',
  corregido: 'exito',
}

export const tonoPago: Record<EstadoPago, Tono> = {
  pagada: 'exito',
  parcial: 'alerta',
  sin_pago: 'peligro',
  saldo_a_favor: 'info',
  ineficaz: 'peligro',
}

/** Retención sin consignar: en alerta mientras corre el plazo de 2 meses; en peligro cuando ya pasó. */
export const tonoConsignacion = (dias: number): Tono => (dias < 0 ? 'peligro' : 'alerta')

export const tonoCheque: Record<EstadoCheque, Tono> = {
  en_canje: 'alerta',
  pagado: 'exito',
  devuelto: 'peligro',
}
