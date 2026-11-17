import type { FormType } from './setup'

// El diseño del PDF de la declaracion. Vive aparte del formulario: ni el borrador ni el export lo
// llevan (ver docs/Pendientes-PDF.md). Hay uno por impuesto, no por municipio.
export type PdfTaxType = FormType

// Las fuentes basicas que usan los municipios. El servidor que convierte tiene que tenerlas
// instaladas, o el PDF sale con otra (docs/Pendientes-PDF.md §7.2).
export type PdfFontFamily =
  'Arial' | 'Helvetica' | 'Times New Roman' | 'Courier New' | 'Verdana' | 'Tahoma'

export interface PdfFontOption {
  family: PdfFontFamily
  // La pila CSS completa, con su generica al final por si el servidor no trae la fuente.
  stack: string
}

// Margen EXTRA en mm, encima de los 5 mm fijos que pone el back. 0 es el piso: menos no se puede.
export interface PdfMargins {
  top: number
  right: number
  bottom: number
  left: number
}

export type PdfTextAlign = 'left' | 'center' | 'right'

export type PdfVerticalAlign = 'top' | 'middle' | 'bottom'

export interface PdfCellBorders {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
}

// Lo que lleva una celda: texto fijo con {Var} mezcladas donde haga falta ("Año {periodo_anio}"),
// HTML libre para lo que el editor no sepa hacer, o una tabla adentro (hasta 4 niveles, como las
// plantillas a mano que dibujan casillas).
export type PdfCellContent =
  | { kind: 'text'; text: string }
  | { kind: 'html'; html: string }
  | { kind: 'table'; table: PdfTable }

export type PdfCellContentKind = PdfCellContent['kind']

// Una celda de <table>. Medidas en px (la hoja mide 778 px de ancho util); lo opcional ausente
// hereda de la tabla. className y style son el escape para quien sabe CSS: style es texto CSS en
// linea, saneado al pintar y al publicar.
export interface PdfCell {
  id: string
  colSpan: number
  rowSpan: number
  content: PdfCellContent
  fontSize?: number
  bold?: boolean
  italic?: boolean
  align?: PdfTextAlign
  verticalAlign?: PdfVerticalAlign
  backgroundColor?: string
  borders?: PdfCellBorders
  className?: string
  style?: string
}

// Lo que la barra lateral cambia de una celda. Una clave con undefined la borra (vuelve a heredar).
export type PdfCellStylePatch = Partial<
  Pick<
    PdfCell,
    | 'fontSize'
    | 'bold'
    | 'italic'
    | 'align'
    | 'verticalAlign'
    | 'backgroundColor'
    | 'borders'
    | 'className'
    | 'style'
  >
>

export type PdfTableStylePatch = Partial<Pick<PdfTable, 'className' | 'style'>>

export interface PdfRow {
  id: string
  height?: number
  cells: PdfCell[]
}

// Las columnas existen aparte de las celdas para guardar su ancho: con colspan, ninguna celda dice
// por si sola cuanto mide una columna. Sin ancho, el navegador reparte.
export interface PdfColumn {
  id: string
  width?: number
}

// Una tabla, suelta en la hoja o dentro de una celda. Las filas siguen el modelo de HTML: cada celda
// aparece una vez, en la fila donde empieza, y su rowSpan y colSpan dicen cuanto ocupa.
export interface PdfTable {
  id: string
  columns: PdfColumn[]
  rows: PdfRow[]
  className?: string
  style?: string
}

export interface PdfTableBlock extends PdfTable {
  kind: 'table'
}

// HTML libre a nivel de hoja: el escape para lo que no es una tabla, incluido un <style> propio.
export interface PdfHtmlBlock {
  kind: 'html'
  id: string
  html: string
}

export type PdfBlock = PdfTableBlock | PdfHtmlBlock

// Cada hoja es su propio bloque, con salto manual entre una y otra. Lo que no cabe no se corre a
// la siguiente: el diseñador avisa.
export interface PdfSheet {
  id: string
  blocks: PdfBlock[]
}

export interface PdfDesign {
  taxType: PdfTaxType
  fontFamily: PdfFontFamily
  // px; las celdas sin fontSize propio heredan este.
  fontSize: number
  margins: PdfMargins
  sheets: PdfSheet[]
}

// Lo que se guarda en localStorage, una llave por impuesto.
export interface StoredPdfDesign {
  schemaVersion: number
  savedAt: string
  design: PdfDesign
}

// Por donde puede llegar el impuesto desde afuera (hoy la URL; mañana quiza un objeto del
// tax-filing-manager). Todo opcional: lo que no llega sale del formulario abierto.
export interface PdfEntryParams {
  impuesto?: string
}

// El area donde cabe el contenido de una hoja, en px, ya descontados los 5 mm del back y el margen
// extra del diseño.
export interface PdfContentBox {
  width: number
  height: number
}

export type PdfSaveResult = { ok: true; savedAt: string } | { ok: false; error: string }

// Que esta seleccionado en el lienzo. Celdas: un rectangulo dentro de UNA tabla, de la celda ancla
// a la del foco (Shift+clic); combinar usa ese rectangulo. Bloque: un bloque de HTML libre.
export type PdfSelection =
  | { kind: 'cells'; tableId: string; anchorCellId: string; focusCellId: string }
  | { kind: 'block'; blockId: string }

// Un rectangulo de la rejilla de una tabla, en indices de fila y columna, ambos lados incluidos.
export interface PdfGridRect {
  top: number
  left: number
  bottom: number
  right: number
}

// Una celda ubicada en la rejilla: donde empieza. Sus spans dicen hasta donde llega.
export interface PdfPlacedCell {
  cell: PdfCell
  row: number
  col: number
}

export type PdfRowPosition = 'above' | 'below'

export type PdfColumnPosition = 'left' | 'right'

// Donde vive una tabla dentro del diseño: en que hoja y a que profundidad (1 = suelta en la hoja).
export interface PdfTableLocation {
  table: PdfTable
  sheetId: string
  depth: number
}
