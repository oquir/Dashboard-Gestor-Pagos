// La forma del .html que publica FormMaker. Sube cuando cambie como se escriben los data-fm-* (no
// cuando cambie el diseño guardado en localStorage, que tiene su propia version). Un archivo de
// una version mas nueva no se abre: se perderia lo que esta version no sabe leer.
// 2 (2026-11-18): las celdas con componente (data-fm-cell="component", data-fm-component y
// data-fm-config). Un archivo de la 1 se sigue abriendo igual.
export const PDF_FILE_FORMAT_VERSION: number = 2

// Los atributos que dejan reabrir el diseño. SelectPdf los ignora.
export const FILE_ATTR = {
  design: 'data-fm-design',
  tax: 'data-fm-tax',
  version: 'data-fm-version',
  font: 'data-fm-font',
  fontSize: 'data-fm-font-size',
  margins: 'data-fm-margins',
  sheet: 'data-fm-sheet',
  block: 'data-fm-block',
  table: 'data-fm-table',
  cell: 'data-fm-cell',
  // Las propiedades de la barra lateral de una celda, en JSON: negrilla, alineacion, bordes…
  props: 'data-fm-props',
  // El CSS que el autor escribio en "Estilos en línea". El style del elemento es la mezcla final
  // (lo del diseñador mas eso) y no se puede separar de vuelta.
  style: 'data-fm-style',
} as const

// Sin esto el navegador pone 8 px de margen al body y todo se corre respecto del lienzo.
export const BASE_CSS: string = 'body { margin: 0; }'

export const FILE_COMMENT: string =
  '<!-- Hecho con el diseñador de PDF de FormMaker. Para volver a abrirlo alla, no quites los atributos data-fm-*: ' +
  'el texto de las celdas se puede cambiar a mano, los estilos se leen de data-fm-style y los componentes ' +
  '(data-fm-component) se rearman desde data-fm-config. -->'

// La N del nombre <impuesto>_v<N>.html (o <municipio>_<impuesto>_v<N>.html, cuando llegue).
export const VERSION_IN_NAME: RegExp = /_v(\d+)\.html?$/i

export const VARIABLE_GLOBAL: RegExp = /\{[^{}\s]+\}/g

export const UNSAFE_INPUT: RegExp = /<(script|iframe|object|embed|form)\b|\son[a-z]+\s*=/i

export const BODY_SELECTOR: RegExp = /(^|[},\s])(body|html)\s*[{,.:#[]/i

// Un @media print con sus reglas adentro (un nivel de llaves, que es lo que traen las plantillas).
export const PRINT_MEDIA: RegExp = /@media\s+print[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/gi

// Las propiedades de celda que viajan en data-fm-props.
export const CELL_PROP_KEYS = [
  'fontSize',
  'bold',
  'italic',
  'align',
  'verticalAlign',
  'backgroundColor',
  'borders',
] as const

export const MESSAGES = {
  newer:
    'Este archivo lo hizo una versión más nueva de FormMaker. Actualiza FormMaker para abrirlo.',
  badFormat: 'El archivo dice ser de FormMaker, pero no trae una versión que se pueda leer.',
  unknownTax: 'El archivo es de FormMaker, pero no dice de qué impuesto es.',
  damaged: 'El archivo es de FormMaker, pero está dañado: no se pudo leer el diseño.',
  empty: 'El archivo no trae nada que pintar.',
  unsafe:
    'Se quitó lo que no es seguro (scripts, iframes, formularios o eventos on…): el PDF no corre JavaScript.',
  font: 'La fuente del archivo no es una de las básicas: quedó Arial.',
  fontSize: 'El tamaño de letra del archivo no se pudo leer: quedó el de siempre.',
  stray: 'Había HTML suelto entre los bloques: quedó como un bloque de HTML.',
  bodyStyle:
    'El <style> le pone estilos a body o html: en el lienzo no se ven, y en el PDF los tapa la letra del diseño. Pásalos a una clase.',
  page: 'Trae @page: el papel y las márgenes los pone el back (carta, 5 mm), no la plantilla.',
  looseDollar: 'Trae ${ sueltos, que salen impresos tal cual.',
} as const
