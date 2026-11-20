import { v4 as uuidv4 } from 'uuid'
import {
  FORM_TYPES,
  PDF_DEFAULT_FONT,
  PDF_DEFAULT_FONT_SIZE,
  PDF_EDGE_GUARD_PX,
  PDF_FONT_OPTIONS,
  PDF_LINE_HEIGHT,
  PDF_MAX_EXTRA_MARGIN_MM,
  PDF_NO_EXTRA_MARGINS,
  PDF_PAPER_WIDTH_MM,
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
import {
  FIT_GUTTER_PX,
  FIT_STEP,
  MARGIN_STEP_MM,
  PDF_CELL_BORDER,
  PDF_CELL_PADDING,
  TAX_PARAM,
} from './pdfDesign.constants'

// Reglas puras del diseno del PDF. Solo lo usa el disenador (React.lazy): fuera de lib/index.ts.

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

// Entre 0 y el tope, de a medio mm; lo que no es numero vuelve a 0.
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

// Los 5 mm del back ya estan descontados en los 778 px y en el alto de la hoja.
export function contentBox(margins: PdfMargins): PdfContentBox {
  return {
    width: PDF_WEB_PAGE_WIDTH_PX - mmToPx(margins.left + margins.right) - 2 * PDF_EDGE_GUARD_PX,
    height: PDF_SHEET_HEIGHT_PX - mmToPx(margins.top + margins.bottom),
  }
}

// Solo los estilos en linea del autor; lo fijo de las tablas va una vez en pdfStyleSheet.
export function tableStyleMap(table: PdfTable): CssStyleMap {
  return parseCssText(sanitizeCss(table.style ?? ''))
}

// Solo lo propio de la celda; relleno y alineacion van en el <style>. Lienzo y generador usan esta
// funcion, o no coincidirian.
export function cellStyleMap(cell: PdfCell): CssStyleMap {
  const hasClasses: boolean = pdfClassTokens(cell.className).length > 0
  return { ...styleMapOf(cell, hasClasses), ...parseCssText(sanitizeCss(cell.style ?? '')) }
}

// El <style> del documento (lienzo y .html): base de las tablas y clases en orden (gana la de mas
// abajo). Cada clase lleva ".x" y ".fm-t > tbody > tr > td.x", que le gana a la base de la celda.
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

// Lo que dan las clases del diseno, en el orden del <style>; las de un <style> a mano no se ven.
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

// Con todos los bordes sale un solo border. clearBorders apaga los lados que la celda no lleva, o
// seguirian los de la clase.
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

// Una llave o un "<" cerraria la regla o la etiqueta: esa declaracion se cae.
function pdfCssDeclarations(map: CssStyleMap): string {
  const safe: CssStyleMap = {}
  for (const [key, value] of Object.entries(map)) {
    if (!/[{}<>]/.test(key) && !/[{}<>]/.test(value)) safe[key] = value
  }
  return pdfCssText(safe)
}

// line-height explicito: en el lienzo heredaria el 1.5 de FormMaker, y no puede ser normal
// (PDF_LINE_HEIGHT).
export function documentStyleMap(design: PdfDesign): CssStyleMap {
  return {
    fontFamily: fontStack(design.fontFamily),
    fontSize: `${design.fontSize}px`,
    lineHeight: String(PDF_LINE_HEIGHT),
    color: '#000',
  }
}

// El zoom del lienzo, siempre dentro del rango y sin colas de coma flotante (1.2500000001).
export function clampPdfZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1
  const clamped: number = Math.min(PDF_ZOOM_MAX, Math.max(PDF_ZOOM_MIN, zoom))
  return Math.round(clamped * 100) / 100
}

// Botones y Ctrl +/- saltan al siguiente multiplo del paso (de 113% a 125%).
export function stepPdfZoom(zoom: number, direction: 1 | -1): number {
  const steps: number = zoom / PDF_ZOOM_STEP
  const next: number = direction === 1 ? Math.floor(steps + 1e-9) + 1 : Math.ceil(steps - 1e-9) - 1
  return clampPdfZoom(next * PDF_ZOOM_STEP)
}

// Ajustar al ancho y zoom al abrir, hacia abajo a 5% para no tener scroll horizontal.
export function fitPdfZoom(viewportWidth: number): number {
  const paperPx: number = PDF_PAPER_WIDTH_MM * PDF_PX_PER_MM
  const raw: number = (viewportWidth - FIT_GUTTER_PX) / paperPx
  if (!Number.isFinite(raw) || raw <= 0) return clampPdfZoom(PDF_ZOOM_MIN)
  return clampPdfZoom(Math.floor(raw / FIT_STEP + 1e-9) * FIT_STEP)
}

// La rueda es continua: proporcional al zoom de ahora, para que se sienta igual de lejos que de cerca.
export function wheelPdfZoom(zoom: number, deltaY: number): number {
  return clampPdfZoom(zoom * (1 - deltaY * PDF_ZOOM_WHEEL_FACTOR))
}

// Lienzo y generador lo toman de aca, o el borde derecho se perderia en uno de los dos.
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

// Recibe el texto y no window.location: sigue siendo pura.
export function readPdfEntryParams(search: string): PdfEntryParams {
  const impuesto: string | null = new URLSearchParams(search).get(TAX_PARAM)
  return impuesto ? { impuesto } : {}
}

// Gana la URL si es un impuesto conocido; si no, el del formulario.
export function resolvePdfTaxType(
  formType: FormType | null,
  entry: PdfEntryParams,
): PdfTaxType | null {
  if (isPdfTaxType(entry.impuesto)) return entry.impuesto
  return formType
}
