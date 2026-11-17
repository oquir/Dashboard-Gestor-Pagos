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

// Una celda de <table>. Las medidas van en px (la hoja mide 778 px de ancho util); lo opcional
// ausente hereda de la tabla.
export interface PdfCell {
  id: string
  colSpan: number
  rowSpan: number
  // Texto fijo con {Var} mezcladas donde haga falta: "Año gravable {periodo_anio}".
  text: string
  width?: number
  fontSize?: number
  bold?: boolean
  align?: PdfTextAlign
  verticalAlign?: PdfVerticalAlign
  backgroundColor?: string
  borders?: PdfCellBorders
}

export interface PdfRow {
  id: string
  height?: number
  cells: PdfCell[]
}

// Cada hoja es su propio bloque, con salto manual entre una y otra. Lo que no cabe no se corre a
// la siguiente: el diseñador avisa.
export interface PdfSheet {
  id: string
  rows: PdfRow[]
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
