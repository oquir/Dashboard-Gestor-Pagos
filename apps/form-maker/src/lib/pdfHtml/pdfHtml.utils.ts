import { NAMED_ENTITIES } from './pdfHtml.constants'

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
export function readTag(html: string, start: number): Tag | null {
  let index: number = start + 1
  const closing: boolean = html[index] === '/'
  if (closing) index++

  const nameMatch: RegExpExecArray | null = /^[a-zA-Z][a-zA-Z0-9-]*/.exec(
    html.slice(index, index + 64),
  )
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
    const attrMatch: RegExpExecArray | null = /^[^\s=>/]+/.exec(html.slice(index))
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
        const unquoted: RegExpExecArray | null = /^[^\s>]*/.exec(html.slice(index))
        value = unquoted ? unquoted[0] : ''
        index += value.length
      }
    }

    // Repetido, gana el primero, como en el navegador.
    if (!attributes.some(([existing]) => existing === attrName)) attributes.push([attrName, value])
  }

  return { name, closing, selfClosing, attributes, end: html.length }
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
