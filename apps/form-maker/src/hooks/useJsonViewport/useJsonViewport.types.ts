import type { JsonRowRange } from '../../types'

export interface ClipBounds {
  top: number
  bottom: number
}

export interface UseJsonViewportResult {
  // Ref de callback: la lista se vuelve a montar al cambiar de vista y hay que re-engancharse.
  listRef: (node: HTMLDivElement | null) => void
  // Ya recortado al numero de filas actual.
  range: JsonRowRange
}
