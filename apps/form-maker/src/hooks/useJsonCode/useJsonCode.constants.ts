import type { JsonHighlight, JsonMatch } from '../../types'

// Vacios compartidos: un [] o un Map nuevo en cada render romperia la memoizacion de lo que depende
// de ellos.
export const NO_SEARCH_INDEX: string[] = []
export const NO_MATCHES: JsonMatch[] = []
export const NO_HIGHLIGHTS: Map<number, JsonHighlight[]> = new Map()
