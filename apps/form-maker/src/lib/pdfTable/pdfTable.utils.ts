import { v4 as uuidv4 } from 'uuid'
import type { PdfCell, PdfPlacedCell, PdfRow, PdfTable } from '../../types'

export interface RowMeta {
  id: string
  height?: number
}

// Una celda vacia. Con `like`, toma sus bordes y sus clases: una fila o columna nueva en una tabla
// armada con clases (la del ICA) sale con el mismo aspecto que su vecina.
export function newCell(like?: Pick<PdfCell, 'borders' | 'className'>): PdfCell {
  const cell: PdfCell = {
    id: uuidv4(),
    colSpan: 1,
    rowSpan: 1,
    content: { kind: 'text', text: '' },
  }
  if (like?.borders) cell.borders = like.borders
  if (like?.className) cell.className = like.className
  return cell
}

export function rowMetas(table: PdfTable): RowMeta[] {
  return table.rows.map((row) =>
    row.height === undefined ? { id: row.id } : { id: row.id, height: row.height },
  )
}

export function lastRow(placed: PdfPlacedCell): number {
  return placed.row + placed.cell.rowSpan - 1
}

export function lastCol(placed: PdfPlacedCell): number {
  return placed.col + placed.cell.colSpan - 1
}

export function covers(placed: PdfPlacedCell, row: number, col: number): boolean {
  return placed.row <= row && row <= lastRow(placed) && placed.col <= col && col <= lastCol(placed)
}

// Rearma las filas a partir de las celdas ubicadas: cada una va en la fila donde empieza, ordenadas
// por columna. Es el camino de vuelta de placeCells y la unica forma en que las operaciones escriben.
export function rebuildRows(metas: RowMeta[], placed: PdfPlacedCell[]): PdfRow[] {
  return metas.map((meta, index) => ({
    ...meta,
    cells: placed
      .filter((item) => item.row === index)
      .sort((a, b) => a.col - b.col)
      .map((item) => item.cell),
  }))
}
