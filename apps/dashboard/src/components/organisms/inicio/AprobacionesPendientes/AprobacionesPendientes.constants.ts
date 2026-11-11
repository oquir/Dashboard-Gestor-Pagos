import { etiquetaEstadoAprobacion } from '../../../../lib/formato'
import type { FiltroAprobaciones } from './AprobacionesPendientes.types'

export const OPCIONES_FILTRO: Record<FiltroAprobaciones, string> = {
  pendientes: 'Pendientes',
  ...etiquetaEstadoAprobacion,
  '': 'Toda aprobación',
}
