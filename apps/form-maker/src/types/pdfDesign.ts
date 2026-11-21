import type { FormType } from './setup'

// Uno por impuesto (no por municipio), fuera del borrador y del export.
export type PdfTaxType = FormType

// El servidor que convierte tiene que tenerlas instaladas (docs/Pendientes-PDF.md §7.2).
export type PdfFontFamily =
  'Arial' | 'Helvetica' | 'Times New Roman' | 'Courier New' | 'Verdana' | 'Tahoma'

export interface PdfFontOption {
  family: PdfFontFamily
  // Con su generica al final, por si el servidor no trae la fuente.
  stack: string
}

// mm EXTRA sobre los 5 mm fijos del back; 0 es el piso.
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

// Texto con {Var}, HTML libre, tabla anidada (hasta 4 niveles) o componente (docs/Pendientes-PDF.md
// §3.3).
export type PdfCellContent =
  | { kind: 'text'; text: string }
  | { kind: 'html'; html: string }
  | { kind: 'table'; table: PdfTable }
  | { kind: 'component'; component: PdfComponent }

// src: URL, base64 o una {Var} del back. px; con una sola medida la otra sale de la proporcion.
export interface PdfImageComponent {
  type: 'image'
  src: string
  alt?: string
  width?: number
  height?: number
}

export type PdfVerticalDirection = 'up' | 'down'

// Sale como PNG porque el WebKit viejo del back no pinta writing-mode: por eso no lleva variables y
// guarda su texto en el .html para reabrirse.
export interface PdfVerticalTextComponent {
  type: 'verticalText'
  text: string
  fontSize: number
  bold: boolean
  // up: se lee de abajo hacia arriba.
  direction: PdfVerticalDirection
  // Ausente: la del documento.
  fontFamily?: PdfFontFamily
}

export interface PdfNitComponent {
  type: 'nit'
  label: string
  number: string
  dv: string
}

// title bajo la raya; details, una linea por salto, con {Var}.
export interface PdfSigner {
  title: string
  details: string
}

export interface PdfSignaturesComponent {
  type: 'signatures'
  signers: PdfSigner[]
  // px en blanco encima de la raya.
  space: number
}

// Imagenes que genera el back: solo se reserva <img src="{variable}">. variable va sin llaves.
export interface PdfBarcodeComponent {
  type: 'barcode'
  variable: string
  width: number
  height: number
}

export interface PdfQrComponent {
  type: 'qr'
  variable: string
  size: number
}

// top/left: centro del texto en % de la imagen.
export interface PdfStampComponent {
  type: 'stamp'
  src: string
  width: number
  height?: number
  text: string
  fontSize: number
  top: number
  left: number
}

export type PdfComponent =
  | PdfImageComponent
  | PdfVerticalTextComponent
  | PdfNitComponent
  | PdfSignaturesComponent
  | PdfBarcodeComponent
  | PdfQrComponent
  | PdfStampComponent

export type PdfComponentType = PdfComponent['type']

export interface PdfComponentOption {
  type: PdfComponentType
  label: string
  description: string
}

// canvas: lo que llena el back sale como caja de muestra; file: el <img src="{…}"> real.
export type PdfComponentMode = 'canvas' | 'file'

export interface PdfVerticalTextSpec {
  text: string
  fontStack: string
  fontSize: number
  bold: boolean
  direction: PdfVerticalDirection
}

// Tamano en px CSS; la imagen esta dibujada a mas resolucion.
export interface PdfVerticalTextImage {
  src: string
  width: number
  height: number
}

// La lib pura no tiene <canvas>: lo pasa quien llama. null: sale texto con writing-mode.
export type PdfVerticalTextRenderer = (spec: PdfVerticalTextSpec) => PdfVerticalTextImage | null

export interface PdfComponentContext {
  mode: PdfComponentMode
  fontFamily: PdfFontFamily
  renderVerticalText: PdfVerticalTextRenderer
}

export interface PdfImageInfo {
  naturalWidth: number
  naturalHeight: number
}

export type PdfImageCheck =
  | { status: 'none' }
  | { status: 'loading' }
  | { status: 'error' }
  | ({ status: 'ok' } & PdfImageInfo)

export type PdfCellContentKind = PdfCellContent['kind']

// Ausente hereda de la clase o del documento; bold/italic en false quitan los de una clase.
export interface PdfStyleProps {
  fontSize?: number
  bold?: boolean
  italic?: boolean
  align?: PdfTextAlign
  verticalAlign?: PdfVerticalAlign
  backgroundColor?: string
  borders?: PdfCellBorders
}

// px (778 de ancho util). className: clases del diseno o de un <style> de bloque HTML. style: CSS
// en linea, saneado al pintar y al publicar.
export interface PdfCell extends PdfStyleProps {
  id: string
  colSpan: number
  rowSpan: number
  content: PdfCellContent
  className?: string
  style?: string
}

// Una clave en undefined la borra (vuelve a heredar).
export type PdfCellStylePatch = Partial<PdfStyleProps & Pick<PdfCell, 'className' | 'style'>>

// Sale una vez en el <style> y cada celda lleva solo class="…" (antes cada <td> repetia su style).
export interface PdfClass extends PdfStyleProps {
  name: string
  css?: string
}

export type PdfClassPatch = Partial<PdfStyleProps & Pick<PdfClass, 'css'>>

export type PdfTableStylePatch = Partial<Pick<PdfTable, 'className' | 'style'>>

export interface PdfRow {
  id: string
  height?: number
  cells: PdfCell[]
}

// Aparte de las celdas para guardar el ancho: con colspan ninguna celda lo dice. Sin ancho reparte
// el navegador.
export interface PdfColumn {
  id: string
  width?: number
}

// Modelo HTML: cada celda aparece una vez, en la fila donde empieza.
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

export interface PdfHtmlBlock {
  kind: 'html'
  id: string
  html: string
}

export type PdfBlock = PdfTableBlock | PdfHtmlBlock

// Salto manual entre hojas: lo que no cabe no se corre, el disenador avisa.
export interface PdfSheet {
  id: string
  blocks: PdfBlock[]
}

export interface PdfDesign {
  taxType: PdfTaxType
  fontFamily: PdfFontFamily
  // px.
  fontSize: number
  margins: PdfMargins
  // Orden del <style>: entre dos clases de una celda gana la de mas abajo.
  classes: PdfClass[]
  sheets: PdfSheet[]
}

// Una llave de localStorage por impuesto. version: la N de <impuesto>_v<N>.html publicada o
// abierta; ausente si nunca se publico.
export interface StoredPdfDesign {
  schemaVersion: number
  savedAt: string
  design: PdfDesign
  version?: number
}

// Arbol de lib/pdfHtml: texto escapado como venia, atributos ya decodificados.
export interface PdfHtmlElement {
  type: 'element'
  name: string
  attributes: [string, string][]
  children: PdfHtmlNode[]
}

export type PdfHtmlNode = PdfHtmlElement | { type: 'text'; text: string }

// formmaker se reabre tal cual; legacy (plantilla a mano) entra entera en la hoja 1.
export type PdfFileRead =
  | {
      ok: true
      source: 'formmaker' | 'legacy'
      design: PdfDesign
      version: number | null
      warnings: string[]
    }
  | { ok: false; error: string }

export interface PdfFileNotice {
  tone: 'info' | 'error'
  title: string
  details: string[]
}

// Hoy llega por la URL. Lo que falta sale del formulario abierto.
export interface PdfEntryParams {
  impuesto?: string
}

// px, ya descontados los 5 mm del back y el margen extra.
export interface PdfContentBox {
  width: number
  height: number
}

export type PdfSaveResult = { ok: true; savedAt: string } | { ok: false; error: string }

// cells: rectangulo dentro de UNA tabla, de la celda ancla a la del foco (Shift+clic).
export type PdfSelection =
  | { kind: 'cells'; tableId: string; anchorCellId: string; focusCellId: string }
  | { kind: 'block'; blockId: string }

// Indices de fila y columna, ambos lados incluidos.
export interface PdfGridRect {
  top: number
  left: number
  bottom: number
  right: number
}

// Donde empieza la celda; los spans dicen hasta donde llega.
export interface PdfPlacedCell {
  cell: PdfCell
  row: number
  col: number
}

export type PdfRowPosition = 'above' | 'below'

export type PdfColumnPosition = 'left' | 'right'

// depth 1 = suelta en la hoja.
export interface PdfTableLocation {
  table: PdfTable
  sheetId: string
  depth: number
}
