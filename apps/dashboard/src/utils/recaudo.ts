import type { FilaRecaudo } from '../types'

/** Lo recaudado en el periodo, sumando los tres impuestos. */
export const totalRecaudo = (f: FilaRecaudo) => Object.values(f.valores).reduce((s, v) => s + v, 0)
