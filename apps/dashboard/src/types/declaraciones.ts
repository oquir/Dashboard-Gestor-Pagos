import type { SituacionAprobacion, SituacionCorreccion } from '../lib/reglas'
import type { Declaracion, EstadoPago } from './dominio'

/** Lo que muestra la página Declaraciones: las presentadas o los omisos (lo que debía presentarse y no se presentó). */
export type VistaDeclaraciones = 'presentadas' | 'omisos'

/** Fila de la tabla de declaraciones. */
export interface FilaDeclaracion {
  d: Declaracion
  nombre: string
  /** NIT o cédula del contribuyente, con su tipo. */
  documento: string
  /** No lo tiene la solicitud de corrección que no se ha aceptado: no se paga. */
  pago?: EstadoPago
  /** Radicado de la declaración que corrige, si es una corrección. */
  corrige?: string
  /** La corrección baja el valor a pagar o sube el saldo a favor de la que corrige. */
  aLaBaja: boolean
  /** Solo en las correcciones a la baja que se radicaron como solicitud. */
  correccion?: SituacionCorreccion
  aprobacion?: SituacionAprobacion
  /** Se presentó antes de que el municipio cargara el calendario de su año gravable. */
  sinCalendario: boolean
  /** El municipio tiene el RIT en el aplicativo, pero el contribuyente no está inscrito. */
  noInscrito: boolean
}
