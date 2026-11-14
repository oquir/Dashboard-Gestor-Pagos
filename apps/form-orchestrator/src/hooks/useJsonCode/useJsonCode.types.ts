import type { RefObject } from 'react'
import type { JsonHighlight, JsonRevealRequest, JsonSearchState, JsonVisibleRow } from '../../types'

export interface UseJsonCodeResult {
  rootRef: RefObject<HTMLDivElement | null>
  rows: JsonVisibleRow[]
  toggle: (lineIndex: number) => void
  longestLine: number
  search: JsonSearchState
  searchInputRef: RefObject<HTMLInputElement | null>
  // Vacio con el buscador cerrado: sin buscador abierto no se resalta nada.
  highlights: Map<number, JsonHighlight[]>
  reveal: JsonRevealRequest | null
  // Posicion en `rows` de la linea pedida en `reveal`, o -1.
  revealIndex: number
}
