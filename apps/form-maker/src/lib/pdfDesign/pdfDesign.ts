import { v4 as uuidv4 } from 'uuid'
import {
  FORM_TYPES,
  PDF_DEFAULT_FONT,
  PDF_DEFAULT_FONT_SIZE,
  PDF_FONT_OPTIONS,
  PDF_MAX_EXTRA_MARGIN_MM,
  PDF_NO_EXTRA_MARGINS,
  PDF_PX_PER_MM,
  PDF_SHEET_HEIGHT_PX,
  PDF_WEB_PAGE_WIDTH_PX,
} from '../../constants'
import type {
  CssStyleMap,
  FormType,
  PdfCell,
  PdfContentBox,
  PdfDesign,
  PdfEntryParams,
  PdfFontFamily,
  PdfMargins,
  PdfSheet,
  PdfTable,
  PdfTaxType,
} from '../../types'
import { parseCssText } from '../cssStyles'
import { sanitizeCss } from '../pdfHtml'
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
    width: PDF_WEB_PAGE_WIDTH_PX - mmToPx(margins.left + margins.right),
    height: PDF_SHEET_HEIGHT_PX - mmToPx(margins.top + margins.bottom),
  }
}

// El CSS de una tabla: lo fijo del diseñador y, encima, lo que el autor escribio en "Estilos en
// línea" (gana el texto libre, como en el resto de FormMaker). table-layout fixed para que los anchos
// de columna en px se respeten y las columnas sin ancho se repartan el resto. El generador del HTML
// final (§3.5) tiene que emitir lo mismo, o el lienzo y el PDF no coinciden.
export function tableStyleMap(table: PdfTable): CssStyleMap {
  return {
    borderCollapse: 'collapse',
    width: '100%',
    tableLayout: 'fixed',
    ...parseCssText(sanitizeCss(table.style ?? '')),
  }
}

export function cellStyleMap(cell: PdfCell): CssStyleMap {
  const map: CssStyleMap = { padding: PDF_CELL_PADDING }
  if (cell.fontSize !== undefined) map.fontSize = `${cell.fontSize}px`
  if (cell.bold) map.fontWeight = 'bold'
  if (cell.italic) map.fontStyle = 'italic'
  if (cell.align) map.textAlign = cell.align
  map.verticalAlign = cell.verticalAlign ?? 'top'
  if (cell.backgroundColor) map.backgroundColor = cell.backgroundColor
  if (cell.borders?.top) map.borderTop = PDF_CELL_BORDER
  if (cell.borders?.right) map.borderRight = PDF_CELL_BORDER
  if (cell.borders?.bottom) map.borderBottom = PDF_CELL_BORDER
  if (cell.borders?.left) map.borderLeft = PDF_CELL_BORDER

  return { ...map, ...parseCssText(sanitizeCss(cell.style ?? '')) }
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
