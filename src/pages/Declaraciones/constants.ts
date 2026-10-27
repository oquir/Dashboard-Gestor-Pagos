import { etiquetaEstadoPago, etiquetaTipoDeclaracion } from '../../lib/formato'
import type { EstadoPago, Impuesto, Opcion, TipoDeclaracion, ValorFiltro } from '../../types'

export const PESTANAS: Opcion<ValorFiltro<Impuesto>>[] = [
  { valor: '', texto: 'Todas' },
  { valor: 'ica', texto: 'ICA anual' },
  { valor: 'reteica', texto: 'ReteICA' },
  { valor: 'autorretencion', texto: 'AutoReteICA' },
]

export const OPCIONES_TIPO: Record<ValorFiltro<TipoDeclaracion>, string> = { '': 'Todo tipo', ...etiquetaTipoDeclaracion }
export const OPCIONES_PAGO: Record<ValorFiltro<EstadoPago>, string> = { '': 'Todo estado de pago', ...etiquetaEstadoPago }
