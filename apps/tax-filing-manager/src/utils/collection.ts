import type { CollectionRow } from '../types'

/** Lo recaudado en el periodo, sumando los tres impuestos. */
export const totalCollection = (f: CollectionRow) =>
  Object.values(f.values).reduce((s, v) => s + v, 0)
