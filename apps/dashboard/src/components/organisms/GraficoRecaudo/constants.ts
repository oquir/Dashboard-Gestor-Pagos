import { CLASE_SERIE } from '../../../constants'
import { IMPUESTOS } from '../../../lib/sesion'
import type { Serie } from './types'

export const SERIES: Serie[] = IMPUESTOS.map((impuesto) => ({ impuesto, clase: CLASE_SERIE[impuesto] }))
export const TODOS = SERIES.map((s) => s.impuesto)

export const VALOR = { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' } as const

export const ALTO = 220
