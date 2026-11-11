import { etiquetaEstadoAprobacion } from '../lib'
import type { FiltroAprobacion, FiltroCorreccion } from '../types'

/** Opciones del filtro por aprobación previa de los listados de declaraciones. */
export const OPCIONES_APROBACION: Record<FiltroAprobacion, string> = {
  '': 'Toda aprobación',
  ...etiquetaEstadoAprobacion,
  no_aplica: 'Sin aprobación previa',
}

/** Opciones del filtro por corrección a la baja de los listados de declaraciones. */
export const OPCIONES_CORRECCION: Record<FiltroCorreccion, string> = {
  '': 'Toda declaración',
  todas: 'Todas las correcciones a la baja',
  directa: 'Correcciones directas',
  por_resolver: 'Solicitudes por resolver',
  aceptada: 'Solicitudes aceptadas',
  aceptada_por_silencio: 'Solicitudes aceptadas por silencio',
  rechazada: 'Solicitudes rechazadas',
}
