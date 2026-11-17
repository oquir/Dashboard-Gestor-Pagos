// Las clases del lienzo del diseñador de PDF. El lienzo vive en un shadow root (ver PdfCanvas), donde
// Tailwind no llega: estas clases las define su propia hoja de estilos y las comparten la hoja, la
// tabla y el lienzo. Prefijo fm- para no chocar con las clases que escriba el autor.
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

// Una {variable} dentro del texto de una celda: se resalta en el lienzo (no en el PDF).
export const PDF_VARIABLE_PATTERN: RegExp = /(\{[^{}\s]+\})/
