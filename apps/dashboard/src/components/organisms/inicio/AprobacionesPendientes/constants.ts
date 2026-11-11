import { etiquetaEstadoAprobacion } from '../../../../lib/formato'
import type { FiltroAprobaciones } from './types'

export const OPCIONES_FILTRO: Record<FiltroAprobaciones, string> = { pendientes: 'Pendientes', ...etiquetaEstadoAprobacion, '': 'Toda aprobación' }
