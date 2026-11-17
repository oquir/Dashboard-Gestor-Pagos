import type { CSSProperties } from 'react'
import { PDF_PAPER_HEIGHT_MM, PDF_PAPER_WIDTH_MM, PDF_PX_PER_MM } from '../../../../constants'
import type { PdfCell, PdfSheet } from '../../../../types'
import { CELL_BORDER } from './PdfSheetView.constants'

export function paperSize(): CSSProperties {
  return { width: PDF_PAPER_WIDTH_MM * PDF_PX_PER_MM, height: PDF_PAPER_HEIGHT_MM * PDF_PX_PER_MM }
}

export function cellStyle(cell: PdfCell): CSSProperties {
  return {
    width: cell.width,
    fontSize: cell.fontSize,
    fontWeight: cell.bold ? 'bold' : undefined,
    textAlign: cell.align,
    verticalAlign: cell.verticalAlign,
    backgroundColor: cell.backgroundColor,
    borderTop: cell.borders?.top ? CELL_BORDER : undefined,
    borderRight: cell.borders?.right ? CELL_BORDER : undefined,
    borderBottom: cell.borders?.bottom ? CELL_BORDER : undefined,
    borderLeft: cell.borders?.left ? CELL_BORDER : undefined,
    padding: 2,
  }
}

export function isSheetEmpty(sheet: PdfSheet): boolean {
  return sheet.rows.every((row) => row.cells.every((cell) => cell.text.trim() === ''))
}
