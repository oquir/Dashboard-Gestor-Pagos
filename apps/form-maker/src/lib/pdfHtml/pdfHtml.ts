import type { CssStyleMap, PdfHtmlElement, PdfHtmlNode } from '../../types'
import {
  ALLOWED_ATTRIBUTES,
  ALLOWED_TAGS,
  DATA_FM_ATTRIBUTE,
  DROP_WITH_CONTENT,
  RAW_TEXT_TAGS,
  SAFE_IMAGE_URL,
  SAFE_LINK_URL,
  VARIABLE_ONLY,
  VOID_TAGS,
} from './pdfHtml.constants'
import {
  closeElement,
  closeImplied,
  decodeEntities,
  escapeAttribute,
  escapeText,
  readTag,
  type Tag,
} from './pdfHtml.utils'

// Saneo del HTML libre: lista blanca sobre texto (no DOM), para correr igual en tsx; la salida se
// reescribe desde cero. Tolera etiquetas sin cerrar, mayusculas y atributos sin comillas. Nunca
// lanza. La segunda barrera es el convertidor del back sin JavaScript.
export function sanitizePdfHtml(html: string): string {
  let out: string = ''
  let index: number = 0
  // Cuenta las aperturas anidadas del mismo nombre para no salir en el primer cierre.
  let dropping: { name: string; depth: number } | null = null

  while (index < html.length) {
    const lt: number = html.indexOf('<', index)
    if (lt === -1) {
      if (!dropping) out += escapeText(html.slice(index))
      break
    }

    if (lt > index && !dropping) out += escapeText(html.slice(index, lt))

    // Comentario: se quita entero. Sin cierre, se traga el resto, como el navegador.
    if (html.startsWith('<!--', lt)) {
      const end: number = html.indexOf('-->', lt + 4)
      index = end === -1 ? html.length : end + 3
      continue
    }

    // <!DOCTYPE …>, <![CDATA[ …]]>, <?xml …?>: fuera.
    if (html[lt + 1] === '!' || html[lt + 1] === '?') {
      const end: number = html.indexOf('>', lt)
      index = end === -1 ? html.length : end + 1
      continue
    }

    const tag: Tag | null = readTag(html, lt)
    if (!tag) {
      // Un "<" que no abre ninguna etiqueta es texto.
      if (!dropping) out += '&lt;'
      index = lt + 1
      continue
    }
    index = tag.end

    if (dropping) {
      if (tag.name === dropping.name) dropping.depth += tag.closing ? -1 : tag.selfClosing ? 0 : 1
      if (dropping.depth === 0) dropping = null
      continue
    }

    if (tag.closing) {
      if (ALLOWED_TAGS.has(tag.name) && !VOID_TAGS.has(tag.name)) out += `</${tag.name}>`
      continue
    }

    // Texto crudo se lee hasta su cierre: ahi un <b> no es etiqueta.
    if (RAW_TEXT_TAGS.has(tag.name) && !tag.selfClosing) {
      const close: number = html.toLowerCase().indexOf(`</${tag.name}`, index)
      const body: string = html.slice(index, close === -1 ? html.length : close)
      const closeEnd: number = close === -1 ? html.length : html.indexOf('>', close)
      index = closeEnd === -1 ? html.length : closeEnd + 1

      if (tag.name === 'style') out += `<style>${sanitizeStyleSheet(body)}</style>`
      continue
    }

    if (DROP_WITH_CONTENT.has(tag.name)) {
      if (!tag.selfClosing) dropping = { name: tag.name, depth: 1 }
      continue
    }

    if (!ALLOWED_TAGS.has(tag.name)) continue

    out += `<${tag.name}${serializeAttributes(tag)}>`
  }

  return out
}

// Lector tolerante de HTML YA SANEADO: cierra lo abierto como el navegador, sin agregar lo que
// falta (ni <tbody> ni <tr>). Nunca lanza.
export function parsePdfHtml(html: string): PdfHtmlNode[] {
  const root: PdfHtmlElement = { type: 'element', name: '#root', attributes: [], children: [] }
  const stack: PdfHtmlElement[] = [root]
  let index: number = 0

  while (index < html.length) {
    const lt: number = html.indexOf('<', index)
    const textEnd: number = lt === -1 ? html.length : lt
    if (textEnd > index) appendText(stack[stack.length - 1], html.slice(index, textEnd))
    if (lt === -1) break

    if (html.startsWith('<!--', lt)) {
      const end: number = html.indexOf('-->', lt + 4)
      index = end === -1 ? html.length : end + 3
      continue
    }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') {
      const end: number = html.indexOf('>', lt)
      index = end === -1 ? html.length : end + 1
      continue
    }

    const tag: Tag | null = readTag(html, lt)
    if (!tag) {
      appendText(stack[stack.length - 1], '&lt;')
      index = lt + 1
      continue
    }
    index = tag.end

    if (tag.closing) {
      closeElement(stack, tag.name)
      continue
    }

    closeImplied(stack, tag.name)
    const element: PdfHtmlElement = {
      type: 'element',
      name: tag.name,
      attributes: tag.attributes.map(([name, value]) => [name, decodeEntities(value)]),
      children: [],
    }
    stack[stack.length - 1].children.push(element)

    if (RAW_TEXT_TAGS.has(tag.name)) {
      const close: number = html.toLowerCase().indexOf(`</${tag.name}`, index)
      const body: string = html.slice(index, close === -1 ? html.length : close)
      if (body) element.children.push({ type: 'text', text: body })
      const closeEnd: number = close === -1 ? html.length : html.indexOf('>', close)
      index = closeEnd === -1 ? html.length : closeEnd + 1
      continue
    }

    // "<div/>" en HTML no se cierra solo: solo las vacias de verdad no llevan hijos.
    if (!VOID_TAGS.has(tag.name)) stack.push(element)
  }

  return root.children
}

export function serializePdfHtml(nodes: PdfHtmlNode[]): string {
  let out: string = ''
  for (const node of nodes) {
    if (node.type === 'text') {
      out += node.text
      continue
    }
    const attributes: string = node.attributes
      .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
      .join('')
    out += `<${node.name}${attributes}>`
    if (VOID_TAGS.has(node.name)) continue
    out += `${serializePdfHtml(node.children)}</${node.name}>`
  }
  return out
}

// Saneado y con todo cerrado: un <table> abierto se tragaria el resto del documento.
export function normalizePdfHtml(html: string): string {
  return serializePdfHtml(parsePdfHtml(sanitizePdfHtml(html)))
}

// El texto que se ve, decodificado (sin etiquetas; un <br> cuenta como salto de linea).
export function pdfHtmlText(nodes: PdfHtmlNode[]): string {
  let out: string = ''
  for (const node of nodes) {
    if (node.type === 'text') out += decodeEntities(node.text)
    else if (node.name === 'br') out += '\n'
    else if (!RAW_TEXT_TAGS.has(node.name)) out += pdfHtmlText(node.children)
  }
  return out
}

// Todo & se escapa, tambien un &nbsp; escrito a mano: es lo que se tecleo.
export function escapePdfText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function escapePdfAttribute(value: string): string {
  return escapeAttribute(value)
}

// En orden y escapados; los null se omiten.
export function pdfAttributes(list: [string, string | null][]): string {
  return list
    .filter((entry): entry is [string, string] => entry[1] !== null)
    .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
    .join('')
}

// camelCase a CSS: --x queda igual y un prefijo (WebkitTransform) recupera su guion.
export function pdfCssText(map: CssStyleMap): string {
  return Object.entries(map)
    .map(([key, value]) => `${key.startsWith('--') ? key : toKebab(key)}: ${value}`)
    .join('; ')
}

// La misma regla que el saneo de src: http(s), data:image o una {Var} sola.
export function isSafePdfImageSrc(src: string): boolean {
  return isSafeUrl(src, SAFE_IMAGE_URL)
}

export function pdfHtmlAttribute(node: PdfHtmlNode, name: string): string | null {
  if (node.type !== 'element') return null
  return node.attributes.find(([attribute]) => attribute === name)?.[1] ?? null
}

// Quita lo que ejecuta o trae algo de afuera (@import, expression(), behavior, -moz-binding, url()
// que no sea imagen segura). Los comentarios se quitan antes: no sirven de escondite.
export function sanitizeCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?(\*\/|$)/g, '')
    .replace(/@import[^;]*;?/gi, '')
    .replace(/expression\s*\(/gi, 'invalid(')
    .replace(/(-moz-binding|behavior)\s*:/gi, 'invalid:')
    .replace(/url\s*\(\s*(['"]?)(.*?)\1\s*\)/gi, (match: string, _quote: string, url: string) =>
      isSafeCssUrl(url) ? match : 'none',
    )
}

function toKebab(key: string): string {
  return key.replace(/[A-Z]/g, (letter: string) => `-${letter.toLowerCase()}`)
}

// Dos textos seguidos se juntan en un nodo: asi un "<" suelto no parte la frase en dos.
function appendText(parent: PdfHtmlElement, text: string): void {
  const last: PdfHtmlNode | undefined = parent.children[parent.children.length - 1]
  if (last?.type === 'text') last.text += text
  else parent.children.push({ type: 'text', text })
}

function sanitizeStyleSheet(css: string): string {
  // Dentro de <style> un "<" solo serviria para cerrar la etiqueta antes de tiempo.
  return sanitizeCss(css).replace(/</g, '\\3c ')
}

function isSafeCssUrl(url: string): boolean {
  // Un escape de CSS ("\6a avascript:") esconde el esquema: con barra invertida, no pasa.
  if (url.includes('\\')) return false
  const trimmed: string = url.trim()
  return SAFE_IMAGE_URL.test(trimmed) || VARIABLE_ONLY.test(trimmed)
}

function serializeAttributes(tag: Tag): string {
  let out: string = ''

  for (const [name, raw] of tag.attributes) {
    if (!ALLOWED_ATTRIBUTES.has(name) && !DATA_FM_ATTRIBUTE.test(name)) continue

    let value: string = decodeEntities(raw)
    if (name === 'style') value = sanitizeCss(value)
    if (name === 'src' && !isSafeUrl(value, SAFE_IMAGE_URL)) continue
    if (name === 'href' && !isSafeUrl(value, SAFE_LINK_URL)) continue
    if ((name === 'src' || name === 'href') && tag.name !== (name === 'src' ? 'img' : 'a')) continue

    out += ` ${name}="${escapeAttribute(value)}"`
  }

  return out
}

// El esquema se mira decodificado y sin espacios ni controles, como lo lee el navegador.
function isSafeUrl(value: string, pattern: RegExp): boolean {
  // eslint-disable-next-line no-control-regex -- quitar los caracteres de control es el punto
  const compact: string = value.replace(/[\u0000- ]/g, '')
  return pattern.test(compact) || VARIABLE_ONLY.test(compact)
}
