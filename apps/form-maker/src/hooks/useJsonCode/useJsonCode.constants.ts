import type { JsonHighlight, JsonMatch } from '../../types'

// Vacios compartidos: uno nuevo en cada render romperia la memoizacion.
export const NO_SEARCH_INDEX: string[] = []
export const NO_MATCHES: JsonMatch[] = []
export const NO_HIGHLIGHTS: Map<number, JsonHighlight[]> = new Map()
