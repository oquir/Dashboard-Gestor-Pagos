import type { SituacionAprobacion } from '../lib/reglas'
import type { Declaracion, EstadoPago } from './dominio'

/** Lo que muestra la página Declaraciones: las presentadas o los omisos (lo que debía presentarse y no se presentó). */
export type VistaDeclaraciones = 'presentadas' | 'omisos'

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
  /** Se presentó antes de que el municipio cargara el calendario de su año gravable. */
  sinCalendario: boolean
  /** El municipio tiene el RIT en el aplicativo, pero el declarante no está inscrito. */
  noInscrito: boolean
}
