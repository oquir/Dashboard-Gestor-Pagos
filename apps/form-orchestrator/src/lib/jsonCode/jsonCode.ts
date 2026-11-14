import type {
  JsonHighlight,
  JsonLine,
  JsonMatch,
  JsonModel,
  JsonSegment,
  JsonVisibleRow,
} from '../../types'
import { foldSearchText } from './jsonCode.utils'

// Resaltado, plegado y busqueda del JSON que se muestra en el lienzo. Es un tokenizador propio y no
// una libreria porque solo hay que distinguir cuatro cosas sobre un JSON que ya se sabe bien formado.
//
// La busqueda existe porque la vista solo pinta las lineas que se ven (ver useJsonViewport): el
// Ctrl+F del navegador no encuentra lo que no esta en el DOM, asi que la vista trae el suyo. Busca
// sobre el texto entero, plegado o no, y no sobre lo pintado.

// La clave se reconoce por los dos puntos que la siguen, que es lo que la separa de un texto.
const TOKEN_RE: RegExp =
  /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g

export function tokenizeJson(json: string): JsonSegment[] {
  const segments: JsonSegment[] = []
  let last = 0
  TOKEN_RE.lastIndex = 0

  let match: RegExpExecArray | null = TOKEN_RE.exec(json)
  while (match !== null) {
    if (match.index > last) segments.push(json.slice(last, match.index))

    const [full, quoted, colon, num, keyword] = match
    const offset: number = match.index

    if (quoted !== undefined) {
      if (colon !== undefined) {
        segments.push({ text: quoted, kind: 'key', offset })
        segments.push(colon)
      } else {
        segments.push({ text: quoted, kind: 'string', offset })
      }
    } else if (num !== undefined) {
      segments.push({ text: num, kind: 'number', offset })
    } else if (keyword !== undefined) {
      segments.push({ text: keyword, kind: keyword === 'null' ? 'null' : 'boolean', offset })
    }

    last = match.index + full.length
    match = TOKEN_RE.exec(json)
  }

  if (last < json.length) segments.push(json.slice(last))

  return segments
}

export function parseJsonLines(json: string): JsonLine[] {
  const raw: string[] = json.split('\n')
  const lines: JsonLine[] = []
  const stack: number[] = []
  let offset = 0

  for (let i = 0; i < raw.length; i++) {
    const text: string = raw[i]
    const line: JsonLine = {
      text,
      offset,
      opensContainer: false,
      openChar: null,
      closeIndex: -1,
      trailingComma: false,
    }
    lines.push(line)
    offset += text.length + 1

    const trimmed: string = text.trim()
    const first: string = trimmed.charAt(0)
    if (first === '}' || first === ']') {
      const opener: number | undefined = stack.pop()
      if (opener !== undefined) {
        lines[opener].closeIndex = i
        lines[opener].trailingComma = trimmed.endsWith(',')
      }
    }

    const lastChar: string = trimmed.charAt(trimmed.length - 1)
    if (lastChar === '{' || lastChar === '[') {
      line.opensContainer = true
      line.openChar = lastChar
      stack.push(i)
    }
  }

  return lines
}

export function buildJsonModel(json: string): JsonModel {
  const lines: JsonLine[] = parseJsonLines(json)
  const rows = lines.map((line) => {
    const indent: string = line.text.slice(0, line.text.length - line.text.trimStart().length)
    return { indent, tokens: tokenizeJson(line.text.slice(indent.length)) }
  })

  return { lines, rows }
}

export function computeVisibleRows(model: JsonModel, collapsed: Set<number>): JsonVisibleRow[] {
  const visible: JsonVisibleRow[] = []
  let i = 0

  while (i < model.lines.length) {
    const line: JsonLine = model.lines[i]
    const { indent, tokens } = model.rows[i]
    const isCollapsed: boolean = line.opensContainer && collapsed.has(i)

    visible.push({
      lineIndex: i,
      key: line.offset,
      indent,
      tokens,
      opensContainer: line.opensContainer,
      isCollapsed,
      closeChar: isCollapsed ? (line.openChar === '{' ? '}' : ']') : '',
      trailingComma: line.trailingComma,
    })

    i = isCollapsed ? line.closeIndex + 1 : i + 1
  }

  return visible
}

// El texto de cada linea preparado para buscar: sin sangria y plegado. Se arma una vez por JSON y
// no en cada tecla del buscador; las posiciones coinciden con las del contenido sin plegar.
export function buildJsonSearchIndex(model: JsonModel): string[] {
  return model.lines.map((line, index) =>
    foldSearchText(line.text.slice(model.rows[index].indent.length)),
  )
}

// Todas las coincidencias, en orden de lectura. Un tramo encontrado no se vuelve a usar: buscar "aa"
// en "aaaa" da dos, como el buscador del navegador. La consulta va tal cual, espacios incluidos:
// buscar `"name": ` tiene sentido en un JSON.
export function findJsonMatches(searchIndex: string[], query: string): JsonMatch[] {
  const needle: string = foldSearchText(query)
  if (needle.length === 0) return []

  const matches: JsonMatch[] = []
  for (let line = 0; line < searchIndex.length; line++) {
    const text: string = searchIndex[line]
    let start: number = text.indexOf(needle)

    while (start !== -1) {
      matches.push({ line, start, end: start + needle.length })
      start = text.indexOf(needle, start + needle.length)
    }
  }

  return matches
}

// Abre los contenedores plegados que esconden la linea, para poder llevar la vista hasta ella.
// Devuelve el mismo Set si no habia nada que abrir, asi el estado no cambia de identidad.
export function expandToLine(model: JsonModel, collapsed: Set<number>, line: number): Set<number> {
  let next: Set<number> | null = null

  for (const opener of collapsed) {
    if (opener < line && model.lines[opener].closeIndex >= line) {
      next ??= new Set<number>(collapsed)
      next.delete(opener)
    }
  }

  return next ?? collapsed
}

// Resaltados agrupados por linea, para que cada fila pintada busque solo los suyos.
export function groupHighlightsByLine(
  matches: JsonMatch[],
  currentIndex: number,
): Map<number, JsonHighlight[]> {
  const byLine: Map<number, JsonHighlight[]> = new Map()

  matches.forEach((match, index) => {
    const highlight: JsonHighlight = {
      start: match.start,
      end: match.end,
      current: index === currentIndex,
    }
    const list: JsonHighlight[] | undefined = byLine.get(match.line)
    if (list) list.push(highlight)
    else byLine.set(match.line, [highlight])
  })

  return byLine
}

// Caracteres de la fila mas larga, con el " … }," de una plegada. La lista virtual fija su ancho
// minimo con esto: medido solo sobre las filas pintadas, el scroll horizontal cambiaria de largo
// mientras uno baja.
export function longestRowLength(model: JsonModel, rows: JsonVisibleRow[]): number {
  let longest: number = 0

  for (const row of rows) {
    const suffix: number = row.isCollapsed
      ? 3 + row.closeChar.length + (row.trailingComma ? 1 : 0)
      : 0
    longest = Math.max(longest, model.lines[row.lineIndex].text.length + suffix)
  }

  return longest
}
