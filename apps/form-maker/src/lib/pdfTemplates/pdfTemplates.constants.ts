import type { PdfClass } from '../../types'

export const GRAY: string = '#f1f1f1'

// Clases cortas para combinar en vez de repetir el style en ~250 celdas. Con dos iguales gana la de
// mas abajo.
export const ICA_CLASS = {
  cell: 'celda',
  bare: 'suelta',
  top: 'arriba',
  bold: 'negrita',
  center: 'centro',
  right: 'derecha',
  gray: 'gris',
  title: 'titulo',
  indent: 'sangria',
} as const

export const ICA_CLASSES: PdfClass[] = [
  // La celda del FUN: los cuatro bordes y el texto al medio.
  {
    name: ICA_CLASS.cell,
    verticalAlign: 'middle',
    borders: { top: true, right: true, bottom: true, left: true },
  },
  // Sin bordes ni relleno de alto: la fila de afuera no crece.
  { name: ICA_CLASS.bare, verticalAlign: 'middle', css: 'padding: 0 2px' },
  { name: ICA_CLASS.top, verticalAlign: 'top' },
  { name: ICA_CLASS.bold, bold: true },
  { name: ICA_CLASS.center, align: 'center' },
  { name: ICA_CLASS.right, align: 'right' },
  { name: ICA_CLASS.gray, backgroundColor: GRAY },
  // El titulo del formulario, un poco mas grande que los 8 px del resto.
  { name: ICA_CLASS.title, fontSize: 10 },
  // Los renglones "MENOS …" van corridos a la derecha, como en el FUN.
  { name: ICA_CLASS.indent, css: 'padding-left: 12px' },
]

// 10 columnas medidas para las variables mas largas: rotulo vertical, renglon y 8 mas (texto 488
// px, valor 238 px). La ultima sin ancho: con table-layout fixed una suma mayor desbordaria la hoja
// (776 px utiles).
export const ICA_COLUMN_WIDTHS: (number | undefined)[] = [
  30,
  22,
  92,
  96,
  172,
  64,
  64,
  92,
  80,
  undefined,
]

// Un valor largo se parte: un PDF mas ancho que 778 px el convertidor lo encoge entero.
export const ICA_TABLE_STYLE: string = 'word-wrap: break-word'

export const ICA_FONT_SIZE: number = 8

// Las 15 del grupo repetible (DEFAULT_GROUP_MAX): la 1 es la principal y la 2 a la 15, Secundaria1
// a 14.
export const ICA_ACTIVITY_COUNT: number = 15

// Alto de cada rotulo vertical, a la medida de su seccion.
export const ICA_LABEL_HEIGHTS = {
  // Mas alta que sus 5 filas, la seccion A crece para hacerle sitio.
  informacion: 66,
  baseGravable: 110,
  // Es la mas ancha (tres lineas de texto): mas alta no cabe en los 30 px de la columna.
  actividades: 70,
  liquidacion: 150,
  pago: 50,
  firmas: 45,
} as const
