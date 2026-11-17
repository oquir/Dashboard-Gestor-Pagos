import type { PdfCellBorders } from '../../types'

export const ALL_SIDES: PdfCellBorders = { top: true, right: true, bottom: true, left: true }

export const NESTED_CELL_STYLE: string = 'padding: 0 2px'

// Los renglones "MENOS …" van corridos a la derecha, como en el FUN.
export const INDENT_STYLE: string = 'padding-left: 12px'

export const GRAY: string = '#f1f1f1'

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

export const ICA_TITLE_FONT_SIZE: number = 10

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
