import type { PdfCell, PdfTable, PdfTableLocation } from '../../types'

// Recorre una tabla y sus anidadas, de afuera hacia adentro. La profundidad de la de afuera es la
// que se le pasa; cada nivel suma uno.
export function findTableIn(
  table: PdfTable,
  tableId: string,
  sheetId: string,
  depth: number,
): PdfTableLocation | null {
  if (table.id === tableId) return { table, sheetId, depth }

  for (const row of table.rows) {
    for (const cell of row.cells) {
      if (cell.content.kind !== 'table') continue
      const found: PdfTableLocation | null = findTableIn(
        cell.content.table,
        tableId,
        sheetId,
        depth + 1,
      )
      if (found) return found
    }
  }
  return null
}

export function findCellIn(
  table: PdfTable,
  cellId: string,
  sheetId: string,
  depth: number,
): (PdfTableLocation & { cell: PdfCell }) | null {
  for (const row of table.rows) {
    for (const cell of row.cells) {
      if (cell.id === cellId) return { table, sheetId, depth, cell }
      if (cell.content.kind !== 'table') continue

      const found = findCellIn(cell.content.table, cellId, sheetId, depth + 1)
      if (found) return found
    }
  }
  return null
}

// Aplica `fn` a la tabla `tableId`, este donde este. Devuelve la misma referencia si nada cambio,
// para que el historial no registre un paso vacio.
export function mapTableIn<T extends PdfTable>(
  table: T,
  tableId: string,
  fn: (table: PdfTable) => PdfTable,
): T {
  if (table.id === tableId) {
    const next: PdfTable = fn(table)
    if (next === table) return table
    // Una tabla suelta en la hoja lleva kind: 'table', que las operaciones de tabla no conocen.
    return ('kind' in table ? { ...next, kind: 'table' } : next) as T
  }

  let changed: boolean = false
  const rows = table.rows.map((row) => {
    let rowChanged: boolean = false
    const cells: PdfCell[] = row.cells.map((cell) => {
      if (cell.content.kind !== 'table') return cell

      const inner: PdfTable = mapTableIn(cell.content.table, tableId, fn)
      if (inner === cell.content.table) return cell
      rowChanged = true
      return { ...cell, content: { kind: 'table' as const, table: inner } }
    })
    if (!rowChanged) return row
    changed = true
    return { ...row, cells }
  })

  return changed ? { ...table, rows } : table
}
