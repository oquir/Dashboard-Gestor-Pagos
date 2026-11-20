import { v4 as uuidv4 } from 'uuid'
import type {
  PdfCell,
  PdfCellContent,
  PdfRow,
  PdfTable,
  PdfTextAlign,
  PdfVerticalAlign,
} from '../../types'
import { ICA_CLASS } from './pdfTemplates.constants'

// Plantillas fila por fila; cada llamada crea ids nuevos. Las opciones se vuelven clases
// (ICA_CLASSES).

export interface CellOptions {
  colSpan?: number
  rowSpan?: number
  bold?: boolean
  align?: PdfTextAlign
  // Al medio por defecto (la clase celda o suelta); top sale con la clase arriba.
  verticalAlign?: PdfVerticalAlign
  // Una letra propia de la celda; el titulo del formulario va con title.
  fontSize?: number
  title?: boolean
  gray?: boolean
  indent?: boolean
  // Por defecto lleva los cuatro bordes, como las celdas del FUN; false para las tablas de adentro.
  border?: boolean
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

// Sin bordes ni relleno de alto: la fila de afuera no crece.
export function bare(value: string, options: CellOptions = {}): PdfCell {
  return html(value, { border: false, ...options })
}

export function image(src: string, height: number): string {
  return `<img src="${src}" style="height: ${height}px">`
}

function build(content: PdfCellContent, options: CellOptions): PdfCell {
  const classes: string[] = [options.border === false ? ICA_CLASS.bare : ICA_CLASS.cell]
  if (options.verticalAlign === 'top') classes.push(ICA_CLASS.top)
  if (options.bold) classes.push(ICA_CLASS.bold)
  if (options.align === 'center') classes.push(ICA_CLASS.center)
  if (options.align === 'right') classes.push(ICA_CLASS.right)
  if (options.gray) classes.push(ICA_CLASS.gray)
  if (options.title) classes.push(ICA_CLASS.title)
  if (options.indent) classes.push(ICA_CLASS.indent)

  const cell: PdfCell = {
    id: uuidv4(),
    colSpan: options.colSpan ?? 1,
    rowSpan: options.rowSpan ?? 1,
    content,
    className: classes.join(' '),
  }
  if (options.verticalAlign === 'bottom') cell.verticalAlign = 'bottom'
  if (options.fontSize) cell.fontSize = options.fontSize
  return cell
}
