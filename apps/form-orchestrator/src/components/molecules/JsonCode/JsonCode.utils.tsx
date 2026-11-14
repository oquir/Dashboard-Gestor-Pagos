import type { ReactNode } from 'react'
import type { JsonHighlight, JsonSegment } from '../../../types'
import {
  JSON_CURRENT_MATCH_CLASS,
  JSON_MATCH_CLASS,
  JSON_TOKEN_CLASSES,
  NO_ROW_HIGHLIGHTS,
} from './JsonCode.constants'

export function decodeString(quoted: string): string {
  try {
    return JSON.parse(quoted) as string
  } catch {
    return quoted
  }
}

export function segmentClass(
  segment: Exclude<JsonSegment, string>,
  valueClassName?: (rawValue: string) => string | undefined,
): string {
  if (segment.kind === 'string' && valueClassName) {
    const custom: string | undefined = valueClassName(decodeString(segment.text))
    if (custom && custom.length > 0) return custom
  }

  return JSON_TOKEN_CLASSES[segment.kind]
}

// Corta el texto de un segmento donde lo tocan las coincidencias. `from` es donde empieza el
// segmento dentro del contenido de la linea, en la misma cuenta que las posiciones del buscador.
// Una coincidencia puede cruzar segmentos ("name": cae entre la clave y los dos puntos), asi que
// cada segmento pinta solo su tramo; la key es la posicion del tramo, que no se repite en la fila.
function highlightPieces(text: string, from: number, highlights: JsonHighlight[]): ReactNode[] {
  const to: number = from + text.length
  const pieces: ReactNode[] = []
  let cursor: number = from

  for (const highlight of highlights) {
    if (highlight.end <= cursor || highlight.start >= to) continue

    const start: number = Math.max(highlight.start, cursor)
    const end: number = Math.min(highlight.end, to)
    if (start > cursor) pieces.push(text.slice(cursor - from, start - from))
    pieces.push(
      <mark
        key={`m-${start}`}
        data-json-current={highlight.current ? '' : undefined}
        className={highlight.current ? JSON_CURRENT_MATCH_CLASS : JSON_MATCH_CLASS}
      >
        {text.slice(start - from, end - from)}
      </mark>,
    )
    cursor = end
  }

  if (cursor < to) pieces.push(text.slice(cursor - from))

  return pieces
}

export function renderTokens(
  tokens: JsonSegment[],
  valueClassName?: (rawValue: string) => string | undefined,
  highlights: JsonHighlight[] = NO_ROW_HIGHLIGHTS,
): ReactNode[] {
  const nodes: ReactNode[] = []
  let position: number = 0

  for (const segment of tokens) {
    const text: string = typeof segment === 'string' ? segment : segment.text
    const content: ReactNode[] =
      highlights.length === 0 ? [text] : highlightPieces(text, position, highlights)
    position += text.length

    if (typeof segment === 'string') {
      nodes.push(...content)
    } else {
      nodes.push(
        <span key={segment.offset} className={segmentClass(segment, valueClassName)}>
          {content}
        </span>,
      )
    }
  }

  return nodes
}
