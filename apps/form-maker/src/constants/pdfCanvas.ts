// Clases del lienzo del PDF, definidas en su propia hoja (el shadow root no ve Tailwind). Prefijo
// fm- para no chocar con las del autor.
export const PDF_CANVAS_CLASS = {
  doc: 'fm-doc',
  sheet: 'fm-sheet',
  paper: 'fm-paper',
  active: 'fm-active',
  back: 'fm-back',
  content: 'fm-content',
  extra: 'fm-extra',
  overflow: 'fm-overflow',
  flow: 'fm-flow',
  caption: 'fm-caption',
  warning: 'fm-warning',
  empty: 'fm-empty',
  cell: 'fm-cell',
  selected: 'fm-selected',
  html: 'fm-html',
  variable: 'fm-var',
} as const

// Marcan cada celda para que el arrastre sepa donde esta el puntero sin un manejador por celda.
export const PDF_CANVAS_ATTRIBUTE = {
  table: 'data-fm-table-id',
  cell: 'data-fm-cell-id',
} as const

// Una {variable} dentro del texto de una celda: se resalta en el lienzo (no en el PDF).
export const PDF_VARIABLE_PATTERN: RegExp = /(\{[^{}\s]+\})/
