import { v4 as uuidv4 } from 'uuid'
import type {
  PdfCell,
  PdfCellContent,
  PdfRow,
  PdfTable,
  PdfTextAlign,
  PdfVerticalAlign,
} from '../../types'
import { ALL_SIDES, NESTED_CELL_STYLE } from './pdfTemplates.constants'

// Piezas para escribir una plantilla de fabrica como se lee: fila por fila, celda por celda. Cada
// llamada crea ids nuevos, asi que dos plantillas armadas nunca comparten celdas.

export interface CellOptions {
  colSpan?: number
  rowSpan?: number
  bold?: boolean
  align?: PdfTextAlign
  verticalAlign?: PdfVerticalAlign
  fontSize?: number
  background?: string
  // Por defecto lleva los cuatro bordes, como las celdas del FUN; false para las tablas de adentro.
  border?: boolean
  style?: string
}

export function text(value: string, options: CellOptions = {}): PdfCell {
  return build({ kind: 'text', text: value }, options)
}

export function html(value: string, options: CellOptions = {}): PdfCell {
  return build({ kind: 'html', html: value }, options)
}

export function nested(table: PdfTable, options: CellOptions = {}): PdfCell {
  return build({ kind: 'table', table }, options)
}

export function row(cells: PdfCell[], height?: number): PdfRow {
  return height ? { id: uuidv4(), height, cells } : { id: uuidv4(), cells }
}

export function table(widths: (number | undefined)[], rows: PdfRow[]): PdfTable {
  return {
    id: uuidv4(),
    columns: widths.map((width) => (width ? { id: uuidv4(), width } : { id: uuidv4() })),
    rows,
  }
}

// Una fila de una tabla de adentro (casillas, firmas): sin bordes y sin relleno de alto, para que
// la fila de afuera no crezca.
export function bare(value: string, options: CellOptions = {}): PdfCell {
  return html(value, { border: false, style: NESTED_CELL_STYLE, ...options })
}

export function image(src: string, height: number): string {
  return `<img src="${src}" style="height: ${height}px">`
}

function build(content: PdfCellContent, options: CellOptions): PdfCell {
  const cell: PdfCell = {
    id: uuidv4(),
    colSpan: options.colSpan ?? 1,
    rowSpan: options.rowSpan ?? 1,
    content,
    verticalAlign: options.verticalAlign ?? 'middle',
  }
  if (options.bold) cell.bold = true
  if (options.align) cell.align = options.align
  if (options.fontSize) cell.fontSize = options.fontSize
  if (options.background) cell.backgroundColor = options.background
  if (options.border !== false) cell.borders = { ...ALL_SIDES }
  if (options.style) cell.style = options.style
  return cell
}
