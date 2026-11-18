import { v4 as uuidv4 } from 'uuid'
import type {
  PdfCell,
  PdfCellBorders,
  PdfCellContent,
  PdfColumn,
  PdfColumnPosition,
  PdfGridRect,
  PdfPlacedCell,
  PdfRowPosition,
  PdfTable,
} from '../../types'
import {
  covers,
  lastCol,
  lastRow,
  newCell,
  rebuildRows,
  type RowMeta,
  rowMetas,
} from './pdfTable.utils'

// Las operaciones de una tabla del PDF: agregar y quitar filas y columnas, combinar y dividir celdas,
// anchos. Puras, sin React ni store, y nunca lanzan: lo que no se puede hacer devuelve la misma tabla
// (la misma referencia, para que el historial no registre un paso vacio).
//
// Todas trabajan igual: ubican cada celda en la rejilla (placeCells, el algoritmo de HTML), mueven
// posiciones y spans con aritmetica, y rearman las filas. Solo tocan su propio nivel: una tabla
// anidada en una celda viaja dentro de ella sin que nadie la mire.

export const ALL_BORDERS: PdfCellBorders = { top: true, right: true, bottom: true, left: true }

export function createTable(columnCount: number, rowCount: number): PdfTable {
  const columns: PdfColumn[] = Array.from({ length: columnCount }, () => ({ id: uuidv4() }))

  return {
    id: uuidv4(),
    columns,
    rows: Array.from({ length: rowCount }, () => ({
      id: uuidv4(),
      cells: columns.map(() => newCell({ borders: ALL_BORDERS })),
    })),
  }
}

// Donde empieza cada celda, como lo calcula el navegador: una celda cae en la primera posicion libre
// de su fila, saltando las que ocupan los rowspan de arriba. Las spans se recortan a lo que cabe, asi
// que un archivo raro (un rowspan que se sale de la tabla, dos celdas encimadas) se lee igual que el
// navegador lo pinta en vez de romper la cuenta.
export function placeCells(table: PdfTable): {
  placed: PdfPlacedCell[]
  rowCount: number
  colCount: number
} {
  const rowCount: number = table.rows.length
  const occupied: boolean[][] = table.rows.map(() => [])
  const placed: PdfPlacedCell[] = []
  let colCount: number = table.columns.length

  table.rows.forEach((row, rowIndex) => {
    let col: number = 0

    for (const cell of row.cells) {
      while (occupied[rowIndex][col]) col++

      // El colspan no puede pisar una posicion que ya ocupa un rowspan de arriba.
      let colSpan: number = 1
      while (colSpan < Math.max(1, cell.colSpan) && !occupied[rowIndex][col + colSpan]) colSpan++
      const rowSpan: number = Math.min(Math.max(1, cell.rowSpan), rowCount - rowIndex)

      for (let r = rowIndex; r < rowIndex + rowSpan; r++) {
        for (let c = col; c < col + colSpan; c++) occupied[r][c] = true
      }

      const fixed: PdfCell =
        colSpan === cell.colSpan && rowSpan === cell.rowSpan ? cell : { ...cell, colSpan, rowSpan }
      placed.push({ cell: fixed, row: rowIndex, col })
      col += colSpan
      colCount = Math.max(colCount, col)
    }
  })

  return { placed, rowCount, colCount }
}

// Deja la tabla sana: tantas columnas como pide la celda mas ancha, y una celda vacia en cada hueco
// de la rejilla. La usan las operaciones al terminar y el lector de archivos.
export function normalizeTable(table: PdfTable): PdfTable {
  const { placed, rowCount, colCount } = placeCells(table)
  const holes: PdfPlacedCell[] = []

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      if (!placed.some((item) => covers(item, row, col))) holes.push({ cell: newCell(), row, col })
    }
  }

  const columns: PdfColumn[] =
    colCount > table.columns.length
      ? [
          ...table.columns,
          ...Array.from({ length: colCount - table.columns.length }, () => ({ id: uuidv4() })),
        ]
      : table.columns
  // placeCells recorre las celdas en el mismo orden que las filas, asi que se comparan una a una: una
  // celda distinta es una span que se recorto.
  const original: PdfCell[] = table.rows.flatMap((row) => row.cells)
  const changed: boolean =
    holes.length > 0 ||
    columns !== table.columns ||
    placed.some((item, index) => item.cell !== original[index])
  if (!changed) return table

  return { ...table, columns, rows: rebuildRows(rowMetas(table), [...placed, ...holes]) }
}

export function findPlaced(table: PdfTable, cellId: string): PdfPlacedCell | null {
  return placeCells(table).placed.find((item) => item.cell.id === cellId) ?? null
}

// El rectangulo que va de una celda a otra, agrandado hasta no cortar ninguna celda combinada: si el
// rectangulo toca un pedazo de una celda, se la lleva entera. Es lo que se puede combinar.
export function selectionRect(
  table: PdfTable,
  anchorId: string,
  focusId: string,
): PdfGridRect | null {
  const { placed } = placeCells(table)
  const anchor: PdfPlacedCell | undefined = placed.find((item) => item.cell.id === anchorId)
  const focus: PdfPlacedCell | undefined = placed.find((item) => item.cell.id === focusId)
  if (!anchor || !focus) return null

  const rect: PdfGridRect = {
    top: Math.min(anchor.row, focus.row),
    left: Math.min(anchor.col, focus.col),
    bottom: Math.max(lastRow(anchor), lastRow(focus)),
    right: Math.max(lastCol(anchor), lastCol(focus)),
  }

  let grew: boolean = true
  while (grew) {
    grew = false
    for (const item of placed) {
      const touches: boolean =
        item.row <= rect.bottom &&
        lastRow(item) >= rect.top &&
        item.col <= rect.right &&
        lastCol(item) >= rect.left
      if (!touches) continue

      const next: PdfGridRect = {
        top: Math.min(rect.top, item.row),
        left: Math.min(rect.left, item.col),
        bottom: Math.max(rect.bottom, lastRow(item)),
        right: Math.max(rect.right, lastCol(item)),
      }
      if (
        next.top !== rect.top ||
        next.left !== rect.left ||
        next.bottom !== rect.bottom ||
        next.right !== rect.right
      ) {
        Object.assign(rect, next)
        grew = true
      }
    }
  }

  return rect
}

// Las celdas que caen dentro del rectangulo (para pintar la seleccion).
export function cellsInRect(table: PdfTable, rect: PdfGridRect): string[] {
  return placeCells(table)
    .placed.filter(
      (item) =>
        item.row >= rect.top &&
        lastRow(item) <= rect.bottom &&
        item.col >= rect.left &&
        lastCol(item) <= rect.right,
    )
    .map((item) => item.cell.id)
}

export function canMerge(table: PdfTable, anchorId: string, focusId: string): boolean {
  const rect: PdfGridRect | null = selectionRect(table, anchorId, focusId)
  return rect !== null && cellsInRect(table, rect).length > 1
}

export function canSplit(table: PdfTable, cellId: string): boolean {
  const placed: PdfPlacedCell | null = findPlaced(table, cellId)
  return placed !== null && (placed.cell.colSpan > 1 || placed.cell.rowSpan > 1)
}

export function insertRow(table: PdfTable, cellId: string, position: PdfRowPosition): PdfTable {
  const { placed, colCount } = placeCells(table)
  const target: PdfPlacedCell | undefined = placed.find((item) => item.cell.id === cellId)
  if (!target) return table

  const at: number = position === 'above' ? target.row : lastRow(target) + 1
  const crossing: PdfPlacedCell[] = []

  const moved: PdfPlacedCell[] = placed.map((item) => {
    if (item.row < at && lastRow(item) >= at) {
      const grown: PdfPlacedCell = {
        ...item,
        cell: { ...item.cell, rowSpan: item.cell.rowSpan + 1 },
      }
      crossing.push(grown)
      return grown
    }
    return item.row >= at ? { ...item, row: item.row + 1 } : item
  })

  const added: PdfPlacedCell[] = []
  for (let col = 0; col < colCount; col++) {
    if (!crossing.some((item) => covers(item, at, col))) {
      added.push({ cell: newCell(target.cell), row: at, col })
    }
  }

  const metas: RowMeta[] = rowMetas(table)
  metas.splice(at, 0, { id: uuidv4() })
  return { ...table, rows: rebuildRows(metas, [...moved, ...added]) }
}

// Quita la fila donde empieza la celda. Una celda que baja desde esa fila sigue viva en la de abajo,
// una fila mas corta; la ultima fila no se quita (una tabla sin filas no se puede ni seleccionar).
export function removeRow(table: PdfTable, cellId: string): PdfTable {
  const { placed, rowCount } = placeCells(table)
  const target: PdfPlacedCell | undefined = placed.find((item) => item.cell.id === cellId)
  if (!target || rowCount <= 1) return table

  const at: number = target.row
  const kept: PdfPlacedCell[] = []

  for (const item of placed) {
    if (item.row === at) {
      if (item.cell.rowSpan > 1) {
        kept.push({ ...item, cell: { ...item.cell, rowSpan: item.cell.rowSpan - 1 } })
      }
    } else if (item.row < at && lastRow(item) >= at) {
      kept.push({ ...item, cell: { ...item.cell, rowSpan: item.cell.rowSpan - 1 } })
    } else {
      kept.push(item.row > at ? { ...item, row: item.row - 1 } : item)
    }
  }

  const metas: RowMeta[] = rowMetas(table)
  metas.splice(at, 1)
  return normalizeTable({ ...table, rows: rebuildRows(metas, kept) })
}

export function insertColumn(
  table: PdfTable,
  cellId: string,
  position: PdfColumnPosition,
): PdfTable {
  const { placed, rowCount } = placeCells(table)
  const target: PdfPlacedCell | undefined = placed.find((item) => item.cell.id === cellId)
  if (!target) return table

  const at: number = position === 'left' ? target.col : lastCol(target) + 1
  const crossing: PdfPlacedCell[] = []

  const moved: PdfPlacedCell[] = placed.map((item) => {
    if (item.col < at && lastCol(item) >= at) {
      const grown: PdfPlacedCell = {
        ...item,
        cell: { ...item.cell, colSpan: item.cell.colSpan + 1 },
      }
      crossing.push(grown)
      return grown
    }
    return item.col >= at ? { ...item, col: item.col + 1 } : item
  })

  const added: PdfPlacedCell[] = []
  for (let row = 0; row < rowCount; row++) {
    if (!crossing.some((item) => covers(item, row, at))) {
      added.push({ cell: newCell(target.cell), row, col: at })
    }
  }

  const columns: PdfColumn[] = [...table.columns]
  columns.splice(at, 0, { id: uuidv4() })
  return { ...table, columns, rows: rebuildRows(rowMetas(table), [...moved, ...added]) }
}

export function removeColumn(table: PdfTable, cellId: string): PdfTable {
  const { placed, colCount } = placeCells(table)
  const target: PdfPlacedCell | undefined = placed.find((item) => item.cell.id === cellId)
  if (!target || colCount <= 1) return table

  const at: number = target.col
  const kept: PdfPlacedCell[] = []

  for (const item of placed) {
    if (item.col <= at && lastCol(item) >= at) {
      if (item.cell.colSpan > 1) {
        kept.push({ ...item, cell: { ...item.cell, colSpan: item.cell.colSpan - 1 } })
      }
    } else {
      kept.push(item.col > at ? { ...item, col: item.col - 1 } : item)
    }
  }

  const columns: PdfColumn[] = table.columns.filter((_, index) => index !== at)
  return normalizeTable({ ...table, columns, rows: rebuildRows(rowMetas(table), kept) })
}

// Combina el rectangulo entre dos celdas. Queda la de arriba a la izquierda con todo el espacio; si
// todas eran texto, los textos no vacios se juntan con un espacio para que no se pierda nada escrito.
export function mergeCells(table: PdfTable, anchorId: string, focusId: string): PdfTable {
  const rect: PdfGridRect | null = selectionRect(table, anchorId, focusId)
  if (!rect) return table

  const { placed } = placeCells(table)
  const inside: PdfPlacedCell[] = placed.filter(
    (item) =>
      item.row >= rect.top &&
      lastRow(item) <= rect.bottom &&
      item.col >= rect.left &&
      lastCol(item) <= rect.right,
  )
  if (inside.length < 2) return table

  const origin: PdfPlacedCell | undefined = inside.find(
    (item) => item.row === rect.top && item.col === rect.left,
  )
  if (!origin) return table

  const texts: string[] = inside
    .map((item) => (item.cell.content.kind === 'text' ? item.cell.content.text.trim() : null))
    .filter((text): text is string => text !== null && text !== '')
  const allText: boolean = inside.every((item) => item.cell.content.kind === 'text')
  const content: PdfCellContent = allText
    ? { kind: 'text', text: texts.join(' ') }
    : origin.cell.content

  const merged: PdfPlacedCell = {
    ...origin,
    cell: {
      ...origin.cell,
      colSpan: rect.right - rect.left + 1,
      rowSpan: rect.bottom - rect.top + 1,
      content,
    },
  }

  const rest: PdfPlacedCell[] = placed.filter((item) => !inside.includes(item))
  return { ...table, rows: rebuildRows(rowMetas(table), [...rest, merged]) }
}

// Deshace una combinacion: la celda vuelve a 1x1 con su contenido, y cada posicion que ocupaba
// recibe una celda vacia con sus mismos bordes.
export function splitCell(table: PdfTable, cellId: string): PdfTable {
  const { placed } = placeCells(table)
  const target: PdfPlacedCell | undefined = placed.find((item) => item.cell.id === cellId)
  if (!target || (target.cell.colSpan === 1 && target.cell.rowSpan === 1)) return table

  const added: PdfPlacedCell[] = []
  for (let row = target.row; row <= lastRow(target); row++) {
    for (let col = target.col; col <= lastCol(target); col++) {
      if (row === target.row && col === target.col) continue
      added.push({ cell: newCell(target.cell), row, col })
    }
  }

  const single: PdfPlacedCell = { ...target, cell: { ...target.cell, colSpan: 1, rowSpan: 1 } }
  const rest: PdfPlacedCell[] = placed.filter((item) => item !== target)
  return { ...table, rows: rebuildRows(rowMetas(table), [...rest, single, ...added]) }
}

// undefined devuelve la columna al reparto automatico.
export function setColumnWidth(
  table: PdfTable,
  colIndex: number,
  width: number | undefined,
): PdfTable {
  const column: PdfColumn | undefined = table.columns[colIndex]
  if (!column || column.width === width) return table

  const next: PdfColumn = width === undefined ? { id: column.id } : { ...column, width }
  return {
    ...table,
    columns: table.columns.map((item, index) => (index === colIndex ? next : item)),
  }
}

export function setRowHeight(table: PdfTable, rowId: string, height: number | undefined): PdfTable {
  const row = table.rows.find((item) => item.id === rowId)
  if (!row || row.height === height) return table

  return {
    ...table,
    rows: table.rows.map((item) => {
      if (item.id !== rowId) return item
      return height === undefined
        ? { id: item.id, cells: item.cells }
        : { id: item.id, height, cells: item.cells }
    }),
  }
}
