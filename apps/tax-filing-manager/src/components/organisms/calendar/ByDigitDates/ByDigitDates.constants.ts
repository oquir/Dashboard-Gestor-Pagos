import type { Frequency } from '../../../../types'

/** Periodos que van juntos en un botón, según la periodicidad; el periodo 1 va primero. */
export const PERIOD_GROUPS: Record<Frequency, number[][]> = {
  annual: [[1]],
  monthly: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12],
  ],
  bimonthly: [
    [1, 2],
    [3, 4],
    [5, 6],
  ],
  quarterly: [
    [1, 2],
    [3, 4],
  ],
}

/**
 * Rejilla de los encabezados, con una columna de fecha por periodo del grupo. Va en un mapa por
 * número de columnas, y no como clase armada en el momento, porque Tailwind solo genera las clases
 * que ve escritas en el código.
 */
export const HEADER_COLUMNS: Record<number, string> = {
  1: 'grid grid-cols-[9.5rem_minmax(0,1fr)] items-end gap-3',
  2: 'grid grid-cols-[9.5rem_minmax(0,1fr)_minmax(0,1fr)] items-end gap-2',
  3: 'grid grid-cols-[9.5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-end gap-2',
}

/** La misma rejilla de las filas, con los dígitos centrados. Debe coincidir con la de arriba. */
export const COLUMNS: Record<number, string> = {
  1: 'grid grid-cols-[9.5rem_minmax(0,1fr)] items-center gap-3',
  2: 'grid grid-cols-[9.5rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2',
  3: 'grid grid-cols-[9.5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2',
}
