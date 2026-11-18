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
// HTML libre para lo que el editor no sepa hacer, una tabla adentro (hasta 4 niveles, como las
// plantillas a mano que dibujan casillas) o un componente: un machetazo que se repite entre
// municipios (docs/Pendientes-PDF.md §3.3).
export type PdfCellContent =
  | { kind: 'text'; text: string }
  | { kind: 'html'; html: string }
  | { kind: 'table'; table: PdfTable }
  | { kind: 'component'; component: PdfComponent }

// Una imagen del municipio (escudo, bandera, eslogan): URL, base64 o una {Var} que llena el back.
// Medidas en px; con una sola, la otra sale de la proporcion de la imagen.
export interface PdfImageComponent {
  type: 'image'
  src: string
  alt?: string
  width?: number
  height?: number
}

export type PdfVerticalDirection = 'up' | 'down'

// Texto vertical: sale como PNG, porque el WebKit viejo del back no pinta bien writing-mode. Por eso
// no lleva variables, y guarda su texto en el .html para reabrirse. Una linea por cada salto.
export interface PdfVerticalTextComponent {
  type: 'verticalText'
  text: string
  fontSize: number
  bold: boolean
  // up: se lee de abajo hacia arriba (la cabeza a la izquierda), como los rotulos de las secciones.
  direction: PdfVerticalDirection
  // Sin fuente propia usa la del documento.
  fontFamily?: PdfFontFamily
}

// El NIT y su digito de verificacion en cajas separadas. Los tres son texto con {Var}.
export interface PdfNitComponent {
  type: 'nit'
  label: string
  number: string
  dv: string
}

// Quien firma: el titulo va bajo la raya, y debajo los detalles (nombre, documento, tarjeta
// profesional), una linea por cada salto, con {Var}.
export interface PdfSigner {
  title: string
  details: string
}

export interface PdfSignaturesComponent {
  type: 'signatures'
  signers: PdfSigner[]
  // px en blanco encima de la raya, donde se firma.
  space: number
}

// Imagenes que genera el back: el diseñador solo reserva su <img src="{variable}">. La variable va
// sin llaves.
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

// El sello de la entidad con un texto encima (hoy {FechaGuardado}). top y left son el centro del
// texto, en % de la imagen: 50/50 es el medio.
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

// Como pinta un componente: en el lienzo, lo que el back llena ({Code}, una imagen por variable)
// sale como una caja de muestra; en el archivo, como el <img src="{…}"> de verdad.
export type PdfComponentMode = 'canvas' | 'file'

export interface PdfVerticalTextSpec {
  text: string
  // La pila CSS completa de la fuente.
  fontStack: string
  fontSize: number
  bold: boolean
  direction: PdfVerticalDirection
}

// El PNG del texto vertical y su tamaño en px CSS (la imagen esta dibujada a mas resolucion).
export interface PdfVerticalTextImage {
  src: string
  width: number
  height: number
}

// Dibujar el PNG necesita un <canvas>, que la lib pura no tiene: se lo pasa quien llama. null si no
// se pudo dibujar; entonces sale texto con writing-mode.
export type PdfVerticalTextRenderer = (spec: PdfVerticalTextSpec) => PdfVerticalTextImage | null

export interface PdfComponentContext {
  mode: PdfComponentMode
  // La fuente del documento, para el texto vertical sin fuente propia.
  fontFamily: PdfFontFamily
  renderVerticalText: PdfVerticalTextRenderer
}

// Lo que se sabe de una imagen ya cargada, para avisar si pesa de mas.
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

// Lo que se guarda en localStorage, una llave por impuesto. `version` es la ultima publicada o
// abierta de archivo (la N de <impuesto>_v<N>.html); ausente si nunca se publico.
export interface StoredPdfDesign {
  schemaVersion: number
  savedAt: string
  design: PdfDesign
  version?: number
}

// El arbol del lector tolerante (lib/pdfHtml). El texto va como venia, escapado; los atributos, ya
// decodificados.
export interface PdfHtmlElement {
  type: 'element'
  name: string
  attributes: [string, string][]
  children: PdfHtmlNode[]
}

export type PdfHtmlNode = PdfHtmlElement | { type: 'text'; text: string }

// Lo que sale de leer un .html: un diseño de FormMaker (se reabre tal cual) o una plantilla vieja
// hecha a mano (entra entera en la hoja 1). `warnings` es lo que conviene revisar.
export type PdfFileRead =
  | {
      ok: true
      source: 'formmaker' | 'legacy'
      design: PdfDesign
      version: number | null
      warnings: string[]
    }
  | { ok: false; error: string }

// El aviso que deja abrir o publicar, arriba del lienzo hasta que se cierra.
export interface PdfFileNotice {
  tone: 'info' | 'error'
  title: string
  details: string[]
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
