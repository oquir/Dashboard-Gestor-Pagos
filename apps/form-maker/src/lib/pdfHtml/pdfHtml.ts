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
import { decodeEntities, escapeAttribute, escapeText, readTag, type Tag } from './pdfHtml.utils'

// El saneo del HTML libre del PDF (docs/Pendientes-PDF.md §2.1): lista blanca propia, como
// serializeRichText, pero sobre texto y no sobre el DOM, por dos razones: corre igual en un script
// de tsx que en el navegador, y la salida se vuelve a escribir desde cero -- etiquetas de la lista,
// atributos de la lista entre comillas y escapados, texto escapado --, asi que nada del original
// pasa tal cual. Tolera lo que las plantillas a mano traen: etiquetas sin cerrar, mayusculas,
// atributos sin comillas. Nunca lanza.
//
// Es la primera barrera; la segunda es el convertidor del back sin JavaScript (§7.1).
export function sanitizePdfHtml(html: string): string {
  let out: string = ''
  let index: number = 0
  // Mientras se esta adentro de algo que se borra con su contenido, se cuenta cuantas aperturas
  // del mismo nombre van, para no salir en el primer cierre de una anidada.
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

    // Lo que tiene texto crudo adentro se lee hasta su cierre de una vez: ahi un "<b>" no es una
    // etiqueta, y leerlo como tal dejaria pasar lo que no se ve.
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

// El CSS de un atributo style o de un campo "Estilos en línea". Quita lo que ejecuta o trae algo de
// afuera: @import, expression(), behavior y -moz-binding (motores viejos) y cualquier url() que no
// sea una imagen http(s), una data:image o una {Var}. Los comentarios se quitan antes, para que no
// sirvan de escondite ("expr/**/ession").
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

// El esquema se mira ya decodificado y sin espacios ni controles, que es como lo lee el navegador:
// "java&#115;cript:" y " javascript:" son javascript:.
function isSafeUrl(value: string, pattern: RegExp): boolean {
  // eslint-disable-next-line no-control-regex -- quitar los caracteres de control es el punto
  const compact: string = value.replace(/[\u0000- ]/g, '')
  return pattern.test(compact) || VARIABLE_ONLY.test(compact)
}
