import type { PdfClass } from '../../types'

export const GRAY: string = '#f1f1f1'

// Las clases de la plantilla del ICA: cortas y para combinar ("celda negrita derecha"), en vez de
// repetir el mismo style en cada una de sus ~250 celdas. El orden importa: con dos que digan lo
// mismo gana la de mas abajo (arriba le gana a la alineacion al medio de celda y suelta).
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
  // Una celda de una tabla de adentro (casillas, firmas): sin bordes y sin relleno de alto, para que
  // la fila de afuera no crezca.
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

// Las 10 columnas de la tabla del ICA, medidas para que quepan las variables mas largas de cada
// columna sin partirse: el rotulo vertical, el numero del renglon y 8 mas. Un renglon usa 5 para el
// texto (488 px) y 3 para el valor (238 px). En las actividades: nombre (c1-c2), codigo CIIU (c3),
// ingresos (c4, la de {IngresosNetosGravablesSecundaria14}), tarifa (c5-c6) e impuesto (c7-c9).
// La ultima va sin ancho y se queda con lo que sobre (64 px): con table-layout fixed, si los anchos
// sumaran mas que el espacio la tabla creceria hasta la suma y se saldria de la hoja. El espacio es
// 778 menos el resguardo de los bordes (PDF_EDGE_GUARD_PX a cada lado), 776.
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

// Un valor largo (un correo, una direccion) se parte en vez de empujar la hoja: un PDF mas ancho
// que 778 px el convertidor lo encoge entero.
export const ICA_TABLE_STYLE: string = 'word-wrap: break-word'

export const ICA_FONT_SIZE: number = 8

// Cuantas actividades caben: las 15 del grupo repetible de la plantilla del formulario
// (DEFAULT_GROUP_MAX). La 1 es la principal; de la 2 a la 15, las variables Secundaria1…14.
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
