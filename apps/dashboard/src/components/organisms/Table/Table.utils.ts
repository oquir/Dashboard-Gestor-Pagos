import { PAGE_SIZES, VISIBLE_PAGES } from './Table.constants'

/**
 * El tamaño con que arranca la tabla: el mayor de PAGE_SIZES que no pase su `perPage`, para que
 * siempre sea una de las opciones del selector (un `perPage` de 15 arranca en 10).
 */
export function initialPageSize(perPage: number): number {
  return PAGE_SIZES.filter((n) => n <= perPage).at(-1) ?? PAGE_SIZES[0]
}

/**
 * Los índices (desde 0) de los botones de página: la actual en el medio, salvo en los extremos,
 * donde la ventana se corre para seguir mostrando VISIBLE_PAGES botones.
 */
export function visiblePages(pageIndex: number, pageCount: number): number[] {
  const size = Math.min(VISIBLE_PAGES, pageCount)
  const start = Math.min(Math.max(pageIndex - Math.floor(size / 2), 0), pageCount - size)
  return Array.from({ length: size }, (_, i) => start + i)
}
