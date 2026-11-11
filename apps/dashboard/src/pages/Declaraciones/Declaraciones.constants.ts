import { etiquetaEstadoPago, etiquetaTipoDeclaracion } from '../../lib'
import type {
  EstadoPago,
  Impuesto,
  Opcion,
  TipoDeclaracion,
  ValorFiltro,
  VistaDeclaraciones,
} from '../../types'

/** Lo presentado o lo que debía presentarse y no se presentó; los omisos solo existen donde está el RIT. */
export const VISTAS: Opcion<VistaDeclaraciones>[] = [
  { valor: 'presentadas', texto: 'Presentadas' },
  { valor: 'omisos', texto: 'Omisos' },
]

export const PESTANAS: Opcion<ValorFiltro<Impuesto>>[] = [
  { valor: '', texto: 'Todas' },
  { valor: 'ica', texto: 'ICA anual' },
  { valor: 'reteica', texto: 'ReteICA' },
  { valor: 'autorretencion', texto: 'AutoReteICA' },
]

export const OPCIONES_TIPO: Record<ValorFiltro<TipoDeclaracion>, string> = {
  '': 'Todo tipo',
  ...etiquetaTipoDeclaracion,
}
export const OPCIONES_PAGO: Record<ValorFiltro<EstadoPago>, string> = {
  '': 'Todo estado de pago',
  ...etiquetaEstadoPago,
}
