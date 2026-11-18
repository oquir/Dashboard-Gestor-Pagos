import type { PdfHtmlElement } from '../../types'
import {
  BLOCK_CLOSES_P,
  CELL_TAGS,
  NAMED_ENTITIES,
  SECTION_TAGS,
  TABLE_PARTS,
  TABLE_SCOPE,
} from './pdfHtml.constants'

// Cierra hasta `name` incluido, si esta abierto antes de toparse con un limite. Un cierre sin
// apertura (o del otro lado de una celda) se ignora, como en el navegador: "</span>" no puede
// cerrar la tabla de afuera.
export function closeElement(stack: PdfHtmlElement[], name: string): void {
  const limits: ReadonlySet<string> =
    name === 'table' ? NO_LIMITS : TABLE_PARTS.has(name) ? TABLE_ONLY : TABLE_SCOPE
  const at: number = findOpen(stack, (open) => open === name, limits)
  if (at > 0) stack.length = at
}

// Lo que una apertura cierra sola: una celda cierra la celda abierta de su fila, una fila cierra
// la fila (y su celda), una seccion de tabla la anterior, un bloque el <p> abierto y un <li> el <li>.
export function closeImplied(stack: PdfHtmlElement[], name: string): void {
  let at: number = -1
  if (CELL_TAGS.has(name)) at = findOpen(stack, (open) => CELL_TAGS.has(open), ROW_LIMITS)
  else if (name === 'tr') at = findOpen(stack, (open) => open === 'tr', TABLE_ONLY)
  else if (SECTION_TAGS.has(name))
    at = findOpen(stack, (open) => SECTION_TAGS.has(open), TABLE_ONLY)
  else if (name === 'li') at = findOpen(stack, (open) => open === 'li', LIST_LIMITS)
  if (BLOCK_CLOSES_P.has(name) && at === -1)
    at = findOpen(stack, (open) => open === 'p', TABLE_SCOPE)
  if (at > 0) stack.length = at
}

const NO_LIMITS: ReadonlySet<string> = new Set()
const TABLE_ONLY: ReadonlySet<string> = new Set(['table'])
const ROW_LIMITS: ReadonlySet<string> = new Set(['tr', 'table'])
const LIST_LIMITS: ReadonlySet<string> = new Set(['ul', 'ol', 'td', 'th', 'table'])

// El indice en la pila del abierto mas cercano que cumple `matches`, o -1 si antes aparece un
// limite. El 0 es la raiz: nunca se cierra.
function findOpen(
  stack: PdfHtmlElement[],
  matches: (name: string) => boolean,
  limits: ReadonlySet<string>,
): number {
  for (let at = stack.length - 1; at > 0; at--) {
    const open: string = stack[at].name
    if (matches(open)) return at
    if (limits.has(open)) return -1
  }
  return -1
}

export interface Tag {
  name: string
  closing: boolean
  selfClosing: boolean
  attributes: [string, string][]
  // Indice justo despues del ">".
  end: number
}

// Lee la etiqueta que empieza en `start` ("<"). null si ese "<" no abre una etiqueta (un "< 3" en
// el texto). Sin ">" de cierre, la etiqueta llega hasta el final del texto, como en el navegador.
//
// Las regex son "sticky" (y) y leen desde lastIndex: un html.slice(index) por atributo copiaria el
// resto del documento cada vez, y con una plantilla de 400 KB eso es cuadratico.
export function readTag(html: string, start: number): Tag | null {
  let index: number = start + 1
  const closing: boolean = html[index] === '/'
  if (closing) index++

  const nameMatch: RegExpExecArray | null = execAt(TAG_NAME, html, index)
  if (!nameMatch) return null

  const name: string = nameMatch[0].toLowerCase()
  index += nameMatch[0].length
  const attributes: [string, string][] = []
  let selfClosing: boolean = false

  while (index < html.length) {
    const char: string = html[index]

    if (char === '>') {
      return { name, closing, selfClosing, attributes, end: index + 1 }
    }
    if (/\s/.test(char)) {
      index++
      continue
    }
    if (char === '/') {
      selfClosing = html[index + 1] === '>'
      index++
      continue
    }

    // Nombre del atributo: hasta un espacio, "=", ">" o "/".
    const attrMatch: RegExpExecArray | null = execAt(ATTRIBUTE_NAME, html, index)
    if (!attrMatch) {
      index++
      continue
    }
    const attrName: string = attrMatch[0].toLowerCase()
    index += attrMatch[0].length
    while (/\s/.test(html[index] ?? '')) index++

    let value: string = ''
    if (html[index] === '=') {
      index++
      while (/\s/.test(html[index] ?? '')) index++

      const quote: string = html[index]
      if (quote === '"' || quote === "'") {
        const close: number = html.indexOf(quote, index + 1)
        value = html.slice(index + 1, close === -1 ? html.length : close)
        index = close === -1 ? html.length : close + 1
      } else {
        const unquoted: RegExpExecArray | null = execAt(UNQUOTED_VALUE, html, index)
        value = unquoted ? unquoted[0] : ''
        index += value.length
      }
    }

    // Repetido, gana el primero, como en el navegador.
    if (!attributes.some(([existing]) => existing === attrName)) attributes.push([attrName, value])
  }

  return { name, closing, selfClosing, attributes, end: html.length }
}

const TAG_NAME: RegExp = /[a-zA-Z][a-zA-Z0-9-]{0,63}/y
const ATTRIBUTE_NAME: RegExp = /[^\s=>/]+/y
const UNQUOTED_VALUE: RegExp = /[^\s>]*/y

function execAt(pattern: RegExp, text: string, index: number): RegExpExecArray | null {
  pattern.lastIndex = index
  return pattern.exec(text)
}

export function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (match: string, body: string) => {
    if (body[0] === '#') {
      const code: number =
        body[1] === 'x' || body[1] === 'X'
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10)
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match
  })
}

// El texto se escapa sin tocar las entidades que ya trae (&nbsp;, &aacute;): solo el "&" suelto.
export function escapeText(text: string): string {
  return text
    .replace(/&(?!(#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);)/gi, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// El valor llega ya decodificado, asi que aca se escapa todo.
export function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
