// La lista blanca del HTML libre del PDF. Solo lo que sirve para maquetar una declaracion impresa:
// tablas, texto, imagenes y <style>. Lo demas se desenvuelve (queda su texto) o se borra entero.
export const ALLOWED_TAGS: ReadonlySet<string> = new Set([
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'td',
  'th',
  'colgroup',
  'col',
  'caption',
  'div',
  'span',
  'p',
  'br',
  'hr',
  'img',
  'a',
  'style',
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'strike',
  'sub',
  'sup',
  'small',
  'big',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  // Las plantillas viejas los usan, y SelectPdf todavia los entiende.
  'font',
  'center',
])

// Se borran con todo lo que tienen adentro: su contenido no es texto para mostrar.
export const DROP_WITH_CONTENT: ReadonlySet<string> = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'noscript',
  'template',
  'frameset',
  'frame',
  'applet',
  'xml',
  'svg',
  'math',
  'title',
  'textarea',
  'select',
  'button',
])

// Su contenido es texto crudo hasta la etiqueta de cierre (no se leen etiquetas adentro).
export const RAW_TEXT_TAGS: ReadonlySet<string> = new Set([
  'script',
  'style',
  'iframe',
  'noscript',
  'template',
  'xmp',
  'title',
  'textarea',
  'noembed',
  'noframes',
])

export const VOID_TAGS: ReadonlySet<string> = new Set(['br', 'hr', 'img', 'col'])

export const ALLOWED_ATTRIBUTES: ReadonlySet<string> = new Set([
  'class',
  'style',
  'id',
  'title',
  'dir',
  'align',
  'valign',
  'width',
  'height',
  'bgcolor',
  'border',
  'cellpadding',
  'cellspacing',
  'colspan',
  'rowspan',
  'nowrap',
  'color',
  'face',
  'size',
  'alt',
  'src',
  'href',
])

// Los atributos de los componentes del diseñador (data-fm-sello, data-fm-texto…): SelectPdf los
// ignora y el lector los usa para reabrir el diseño.
export const DATA_FM_ATTRIBUTE: RegExp = /^data-fm-[a-z0-9-]+$/

// Una variable sola, como src="{Code}": la imagen la pone el back al reemplazar.
export const VARIABLE_ONLY: RegExp = /^\{[^{}\s]+\}$/

export const SAFE_IMAGE_URL: RegExp =
  /^(https?:\/\/|data:image\/(png|jpe?g|gif|webp|bmp|svg\+xml)[;,])/i

export const SAFE_LINK_URL: RegExp = /^(https?:\/\/|mailto:)/i

export const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}
