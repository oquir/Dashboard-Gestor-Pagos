export type JsonTokenKind = 'key' | 'string' | 'number' | 'boolean' | 'null'

export interface JsonToken {
  text: string
  kind: JsonTokenKind
  offset: number
}

export type JsonSegment = string | JsonToken

export interface JsonLine {
  text: string
  offset: number
  opensContainer: boolean
  openChar: '{' | '[' | null
  closeIndex: number
  trailingComma: boolean
}

export interface JsonRowTokens {
  indent: string
  tokens: JsonSegment[]
}

export interface JsonModel {
  lines: JsonLine[]
  rows: JsonRowTokens[]
}

export interface JsonVisibleRow {
  lineIndex: number
  key: number
  indent: string
  tokens: JsonSegment[]
  opensContainer: boolean
  isCollapsed: boolean
  closeChar: string
  trailingComma: boolean
}

export interface JsonCodeProps {
  json: string
  valueClassName?: (rawValue: string) => string | undefined
  className?: string
  // Ctrl+F abre el buscador propio aunque el puntero no este encima. Lo piden las vistas JSON y
  // Payload, que ocupan el lienzo entero; el panel del simulador solo lo abre con el puntero o el
  // foco adentro, para no robarle el Ctrl+F al formulario que se esta llenando al lado.
  captureFind?: boolean
}

// Una coincidencia del buscador: la linea del JSON y el tramo dentro de su contenido, contado sin la
// sangria (que nunca se pinta como texto buscable).
export interface JsonMatch {
  line: number
  start: number
  end: number
}

// Lo que se resalta en una linea ya pintada. `current` es la coincidencia a la que se salto.
export interface JsonHighlight {
  start: number
  end: number
  current: boolean
}

// Las filas visibles que se pintan, como [start, end) sobre las filas desplegadas.
export interface JsonRowRange {
  start: number
  end: number
}

// El buscador propio de la vista JSON, tal como lo arma useJsonCode y lo pinta JsonSearchBar. El ref
// del input viaja aparte (searchInputRef): metido en este objeto, la regla de refs del compilador lo
// trataria entero como un ref y no dejaria leer nada de el al pintar.
export interface JsonSearchState {
  isOpen: boolean
  query: string
  total: number
  // -1 sin coincidencias.
  currentIndex: number
  setQuery: (query: string) => void
  next: () => void
  previous: () => void
  close: () => void
}

// Pedido de llevar la vista a una linea. `token` cambia en cada pedido, asi volver a pedir la misma
// linea (Enter con una sola coincidencia) tambien mueve la vista.
export interface JsonRevealRequest {
  line: number
  token: number
}
