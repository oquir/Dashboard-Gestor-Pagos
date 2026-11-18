import { v4 as uuidv4 } from 'uuid'
import {
  FORM_TYPES,
  PDF_DEFAULT_FONT,
  PDF_DEFAULT_FONT_SIZE,
  PDF_EDGE_GUARD_PX,
  PDF_FONT_OPTIONS,
  PDF_MAX_EXTRA_MARGIN_MM,
  PDF_NO_EXTRA_MARGINS,
  PDF_CLASS_NAME_PATTERN,
  PDF_PX_PER_MM,
  PDF_RESERVED_CLASS_PREFIX,
  PDF_SHEET_HEIGHT_PX,
  PDF_STYLE_KEYS,
  PDF_TABLE_CLASS,
  PDF_WEB_PAGE_WIDTH_PX,
  PDF_ZOOM_MAX,
  PDF_ZOOM_MIN,
  PDF_ZOOM_STEP,
  PDF_ZOOM_WHEEL_FACTOR,
} from '../../constants'
import type {
  CssStyleMap,
  FormType,
  PdfCell,
  PdfClass,
  PdfContentBox,
  PdfDesign,
  PdfEntryParams,
  PdfFontFamily,
  PdfMargins,
  PdfSheet,
  PdfStyleProps,
  PdfTable,
  PdfTaxType,
} from '../../types'
import { parseCssText } from '../cssStyles'
import { pdfCssText, sanitizeCss } from '../pdfHtml'
import { MARGIN_STEP_MM, PDF_CELL_BORDER, PDF_CELL_PADDING, TAX_PARAM } from './pdfDesign.constants'

// Reglas puras del diseño del PDF: medidas de la hoja, el diseño en blanco y de que impuesto es.
// Sin React ni store. Solo lo usa el diseñador, que se carga con React.lazy: por eso no esta en
// lib/index.ts y se importa por su carpeta.

// Una hoja nueva no trae nada: la primera tabla o el primer bloque de HTML los agrega el autor.
export function createBlankSheet(): PdfSheet {
  return { id: uuidv4(), blocks: [] }
}

export function createBlankDesign(taxType: PdfTaxType): PdfDesign {
  return {
    taxType,
    fontFamily: PDF_DEFAULT_FONT,
    fontSize: PDF_DEFAULT_FONT_SIZE,
    margins: PDF_NO_EXTRA_MARGINS,
    classes: [],
    sheets: [createBlankSheet()],
  }
}

export function mmToPx(mm: number): number {
  return mm * PDF_PX_PER_MM
}

// Un margen extra valido: entre 0 y el tope, de a medio mm. Lo que no es un numero vuelve a 0, que
// es lo mismo que no pedir margen extra: nunca puede bajar de los 5 mm del back.
export function clampExtraMargin(mm: number): number {
  if (!Number.isFinite(mm) || mm <= 0) return 0

  const stepped: number = Math.round(mm / MARGIN_STEP_MM) * MARGIN_STEP_MM
  return Math.min(stepped, PDF_MAX_EXTRA_MARGIN_MM)
}

export function normalizeMargins(margins: PdfMargins): PdfMargins {
  return {
    top: clampExtraMargin(margins.top),
    right: clampExtraMargin(margins.right),
    bottom: clampExtraMargin(margins.bottom),
    left: clampExtraMargin(margins.left),
  }
}

// Donde cabe el contenido de cada hoja. Los lados salen del relleno del contenedor (valen en todas
// las hojas) y arriba y abajo del relleno de cada hoja; los 5 mm del back ya estan descontados en
// los 778 px y en el alto de la hoja.
export function contentBox(margins: PdfMargins): PdfContentBox {
  return {
    width: PDF_WEB_PAGE_WIDTH_PX - mmToPx(margins.left + margins.right) - 2 * PDF_EDGE_GUARD_PX,
    height: PDF_SHEET_HEIGHT_PX - mmToPx(margins.top + margins.bottom),
  }
}

// El CSS en linea de una tabla: solo lo que el autor escribio en "Estilos en línea". Lo fijo del
// diseñador (collapse, ancho completo, table-layout fixed para que los anchos de columna en px se
// respeten) va una sola vez en el <style> del documento (pdfStyleSheet), colgado de PDF_TABLE_CLASS.
export function tableStyleMap(table: PdfTable): CssStyleMap {
  return parseCssText(sanitizeCss(table.style ?? ''))
}

// El CSS en linea de una celda: solo lo suyo, encima de sus clases. El relleno y la alineacion arriba
// de siempre estan en el <style> (pdfStyleSheet); antes iban en cada <td> y eran casi la mitad del
// .html. El lienzo y el generador llaman a esta misma funcion, o no coincidirian.
export function cellStyleMap(cell: PdfCell): CssStyleMap {
  const hasClasses: boolean = pdfClassTokens(cell.className).length > 0
  return { ...styleMapOf(cell, hasClasses), ...parseCssText(sanitizeCss(cell.style ?? '')) }
}

// El <style> del documento: la base de las tablas del editor y las clases del diseño, en su orden
// (con dos clases en una celda gana la de mas abajo, como en cualquier CSS). Lo usan el lienzo,
// dentro de su shadow root, y el .html, en su <head>.
//
// Cada clase sale con dos selectores: ".x" para cualquier elemento (un <span class="x"> del HTML
// libre) y ".fm-t > tbody > tr > td.x" para las celdas, que tiene que ganarle a la base de la celda
// (un ".x" solo pesa menos que ".fm-t > tbody > tr > td" y no podria cambiarle el relleno).
export function pdfStyleSheet(design: PdfDesign): string {
  const table: string = `.${PDF_TABLE_CLASS}`
  const cell: string = `${table} > tbody > tr > td`
  const rules: string[] = [
    `${table} { ${pdfCssDeclarations({ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' })} }`,
    `${cell} { ${pdfCssDeclarations({ padding: PDF_CELL_PADDING, verticalAlign: 'top' })} }`,
  ]
  for (const item of design.classes) {
    if (!isValidPdfClassName(item.name)) continue
    const declarations: string = pdfCssDeclarations(classStyleMap(item))
    if (declarations) rules.push(`.${item.name}, ${cell}.${item.name} { ${declarations} }`)
  }
  return rules.join('\n')
}

export function classStyleMap(item: PdfClass): CssStyleMap {
  return { ...styleMapOf(item, false), ...parseCssText(sanitizeCss(item.css ?? '')) }
}

// Las clases de una celda, sin repetidas.
export function pdfClassTokens(className: string | undefined): string[] {
  return [...new Set((className ?? '').split(/\s+/).filter(Boolean))]
}

// Lo que la celda recibe de sus clases del diseño, en el orden del <style>: con lo mismo en dos, la
// de mas abajo gana. Las clases que no son del diseño (las de un <style> a mano) no se ven aca.
export function inheritedCellStyle(design: PdfDesign, cell: PdfCell): PdfStyleProps {
  const tokens: Set<string> = new Set(pdfClassTokens(cell.className))
  const merged: PdfStyleProps = {}
  for (const item of design.classes) {
    if (!tokens.has(item.name)) continue
    for (const key of PDF_STYLE_KEYS) {
      if (item[key] !== undefined) (merged as Record<string, unknown>)[key] = item[key]
    }
  }
  return merged
}

export function isValidPdfClassName(name: string): boolean {
  return PDF_CLASS_NAME_PATTERN.test(name) && !name.startsWith(PDF_RESERVED_CLASS_PREFIX)
}

// Las propiedades de la barra lateral, como CSS. Con todos los bordes sale un solo "border". Una
// celda con clases que define sus propios bordes apaga los lados que no lleva (clearBorders): si
// no, los de la clase seguirian ahi.
function styleMapOf(props: PdfStyleProps, clearBorders: boolean): CssStyleMap {
  const map: CssStyleMap = {}
  if (props.fontSize !== undefined) map.fontSize = `${props.fontSize}px`
  if (props.bold !== undefined) map.fontWeight = props.bold ? 'bold' : 'normal'
  if (props.italic !== undefined) map.fontStyle = props.italic ? 'italic' : 'normal'
  if (props.align) map.textAlign = props.align
  if (props.verticalAlign) map.verticalAlign = props.verticalAlign
  if (props.backgroundColor) map.backgroundColor = props.backgroundColor

  const borders = props.borders
  if (borders) {
    const sides = [
      ['borderTop', borders.top],
      ['borderRight', borders.right],
      ['borderBottom', borders.bottom],
      ['borderLeft', borders.left],
    ] as const
    if (sides.every(([, on]) => on)) map.border = PDF_CELL_BORDER
    else if (clearBorders && sides.every(([, on]) => !on)) map.border = 'none'
    else {
      for (const [key, on] of sides) {
        if (on) map[key] = PDF_CELL_BORDER
        else if (clearBorders) map[key] = 'none'
      }
    }
  }
  return map
}

// "a: b; c: d" para una regla del <style>. Una llave o un "<" en un valor libre cerraria la regla
// o la etiqueta antes de tiempo: esa declaracion se cae.
function pdfCssDeclarations(map: CssStyleMap): string {
  const safe: CssStyleMap = {}
  for (const [key, value] of Object.entries(map)) {
    if (!/[{}<>]/.test(key) && !/[{}<>]/.test(value)) safe[key] = value
  }
  return pdfCssText(safe)
}

// La letra de todo el documento. line-height va explicito: el lienzo vive dentro de FormMaker y
// heredaria su 1.5, mientras que el convertidor arranca en normal; sin el, las filas del lienzo
// saldrian mas altas que en el PDF.
export function documentStyleMap(design: PdfDesign): CssStyleMap {
  return {
    fontFamily: fontStack(design.fontFamily),
    fontSize: `${design.fontSize}px`,
    lineHeight: 'normal',
    color: '#000',
  }
}

// El zoom del lienzo, siempre dentro del rango y sin colas de coma flotante (1.2500000001).
export function clampPdfZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1
  const clamped: number = Math.min(PDF_ZOOM_MAX, Math.max(PDF_ZOOM_MIN, zoom))
  return Math.round(clamped * 100) / 100
}

// Los botones y Ctrl +/- saltan al siguiente multiplo del paso, no suman 25 % a lo que haya: tras
// acercar con la rueda a 113 %, "+" lleva a 125 % y no a 138 %.
export function stepPdfZoom(zoom: number, direction: 1 | -1): number {
  const steps: number = zoom / PDF_ZOOM_STEP
  const next: number = direction === 1 ? Math.floor(steps + 1e-9) + 1 : Math.ceil(steps - 1e-9) - 1
  return clampPdfZoom(next * PDF_ZOOM_STEP)
}

// La rueda es continua: proporcional al zoom de ahora, para que se sienta igual de lejos que de cerca.
export function wheelPdfZoom(zoom: number, deltaY: number): number {
  return clampPdfZoom(zoom * (1 - deltaY * PDF_ZOOM_WHEEL_FACTOR))
}

// El relleno de los lados del contenido de cada hoja (PDF_EDGE_GUARD_PX): el lienzo y el generador
// lo toman de aca, o el borde derecho volveria a perderse en uno de los dos.
export function sheetEdgeStyleMap(): CssStyleMap {
  return {
    paddingLeft: `${PDF_EDGE_GUARD_PX}px`,
    paddingRight: `${PDF_EDGE_GUARD_PX}px`,
  }
}

export function fontStack(family: PdfFontFamily): string {
  return PDF_FONT_OPTIONS.find((option) => option.family === family)?.stack ?? family
}

export function isPdfTaxType(value: unknown): value is PdfTaxType {
  return FORM_TYPES.some((option) => option.value === value)
}

export function taxTypeLabel(taxType: PdfTaxType): string {
  return FORM_TYPES.find((option) => option.value === taxType)?.label ?? taxType
}

// Lee de la URL lo que pueda traer quien abre FormMaker (?impuesto=autorretencion). Recibe el texto
// y no window.location, para seguir siendo pura.
export function readPdfEntryParams(search: string): PdfEntryParams {
  const impuesto: string | null = new URLSearchParams(search).get(TAX_PARAM)
  return impuesto ? { impuesto } : {}
}

// De que impuesto es la plantilla: lo que llegue de afuera gana si es un impuesto conocido; si no,
// el del formulario abierto. null si ninguno de los dos lo dice.
export function resolvePdfTaxType(
  formType: FormType | null,
  entry: PdfEntryParams,
): PdfTaxType | null {
  if (isPdfTaxType(entry.impuesto)) return entry.impuesto
  return formType
}
