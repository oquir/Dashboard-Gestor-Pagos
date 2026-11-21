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
  // Ctrl+F sin el puntero encima (vistas JSON y Payload). El panel del simulador no lo usa, para no
  // robarle el Ctrl+F al formulario de al lado.
  captureFind?: boolean
}

// start/end dentro del contenido, sin contar la sangria.
export interface JsonMatch {
  line: number
  start: number
  end: number
}

export interface JsonHighlight {
  start: number
  end: number
  current: boolean
}

// [start, end) sobre las filas desplegadas.
export interface JsonRowRange {
  start: number
  end: number
}

// El ref del input va aparte (searchInputRef): metido aca, el compilador trataria el objeto entero
// como ref y no dejaria leerlo al pintar.
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

// token cambia en cada pedido, asi repetir la misma linea tambien mueve la vista.
export interface JsonRevealRequest {
  line: number
  token: number
}
