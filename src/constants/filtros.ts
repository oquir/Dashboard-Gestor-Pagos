import { etiquetaEstadoAprobacion } from '../lib/formato'
import type { FiltroAprobacion } from '../types'

/** Opciones del filtro por aprobación previa de los listados de declaraciones. */
export const OPCIONES_APROBACION: Record<FiltroAprobacion, string> = { '': 'Toda aprobación', ...etiquetaEstadoAprobacion, no_aplica: 'Sin aprobación previa' }
