import { v4 as uuidv4 } from 'uuid'
import { PDF_MAX_TABLE_DEPTH, PDF_NEW_TABLE_SIZE } from '../../constants'
import type {
  PdfBlock,
  PdfCell,
  PdfCellContent,
  PdfCellContentKind,
  PdfCellStylePatch,
  PdfComponent,
  PdfDesign,
  PdfGridRect,
  PdfSelection,
  PdfSheet,
  PdfTable,
  PdfTableLocation,
  PdfTableStylePatch,
} from '../../types'
import { createPdfComponent, pdfComponentText } from '../pdfComponents'
import { cellsInRect, createTable, selectionRect } from '../pdfTable'
import { findCellIn, findTableIn, mapTableIn } from './pdfDesignEdit.utils'

// Las ediciones del diseño entero: hojas, bloques, celdas y tablas donde sea que esten (tambien
// anidadas). Puras y sin store. Lo que no cambia nada devuelve la misma referencia del diseño: el
// historial de deshacer compara por referencia y asi no registra pasos vacios.

export function findTable(design: PdfDesign, tableId: string): PdfTableLocation | null {
  for (const sheet of design.sheets) {
    for (const block of sheet.blocks) {
      if (block.kind !== 'table') continue
      const found: PdfTableLocation | null = findTableIn(block, tableId, sheet.id, 1)
      if (found) return found
    }
  }
  return null
}

export function findCell(
  design: PdfDesign,
  cellId: string,
): (PdfTableLocation & { cell: PdfCell }) | null {
  for (const sheet of design.sheets) {
    for (const block of sheet.blocks) {
      if (block.kind !== 'table') continue
      const found = findCellIn(block, cellId, sheet.id, 1)
      if (found) return found
    }
  }
  return null
}

export function findBlock(
  design: PdfDesign,
  blockId: string,
): { block: PdfBlock; sheetId: string } | null {
  for (const sheet of design.sheets) {
    const block: PdfBlock | undefined = sheet.blocks.find((item) => item.id === blockId)
    if (block) return { block, sheetId: sheet.id }
  }
  return null
}

export function mapTable(
  design: PdfDesign,
  tableId: string,
  fn: (table: PdfTable) => PdfTable,
): PdfDesign {
  return mapBlocks(design, (block) =>
    block.kind === 'table' ? mapTableIn(block, tableId, fn) : block,
  )
}

export function mapCell(
  design: PdfDesign,
  cellId: string,
  fn: (cell: PdfCell) => PdfCell,
): PdfDesign {
  const location = findCell(design, cellId)
  if (!location) return design

  return mapTable(design, location.table.id, (table) => {
    let changed: boolean = false
    const rows = table.rows.map((row) => {
      const index: number = row.cells.findIndex((cell) => cell.id === cellId)
      if (index === -1) return row

      const next: PdfCell = fn(row.cells[index])
      if (next === row.cells[index]) return row
      changed = true
      return { ...row, cells: row.cells.map((cell, i) => (i === index ? next : cell)) }
    })
    return changed ? { ...table, rows } : table
  })
}

export function updateCellStyle(
  design: PdfDesign,
  cellId: string,
  patch: PdfCellStylePatch,
): PdfDesign {
  return mapCell(design, cellId, (cell) => applyPatch(cell, patch))
}

export function updateTableStyle(
  design: PdfDesign,
  tableId: string,
  patch: PdfTableStylePatch,
): PdfDesign {
  return mapTable(design, tableId, (table) => applyPatch(table, patch))
}

export function setCellText(design: PdfDesign, cellId: string, text: string): PdfDesign {
  return mapCell(design, cellId, (cell) =>
    cell.content.kind === 'text' && cell.content.text === text
      ? cell
      : { ...cell, content: { kind: 'text', text } },
  )
}

export function setCellHtml(design: PdfDesign, cellId: string, html: string): PdfDesign {
  return mapCell(design, cellId, (cell) =>
    cell.content.kind === 'html' && cell.content.html === html
      ? cell
      : { ...cell, content: { kind: 'html', html } },
  )
}

// Reemplaza el componente de la celda (o pone uno donde habia otra cosa). Uno igual al que ya tiene
// no cambia nada: la barra lateral lo arma de nuevo en cada tecla.
export function setCellComponent(
  design: PdfDesign,
  cellId: string,
  component: PdfComponent,
): PdfDesign {
  return mapCell(design, cellId, (cell) =>
    cell.content.kind === 'component' &&
    JSON.stringify(cell.content.component) === JSON.stringify(component)
      ? cell
      : { ...cell, content: { kind: 'component', component } },
  )
}

// Hasta donde se puede anidar: la celda vive en una tabla de profundidad d, y su tabla nueva seria
// d + 1.
export function canNestTable(design: PdfDesign, cellId: string): boolean {
  const location = findCell(design, cellId)
  return location !== null && location.depth < PDF_MAX_TABLE_DEPTH
}

// Cambia lo que lleva la celda. Lo que se pueda se conserva: el texto pasa a HTML escapado (se ve
// igual), el HTML a texto sin etiquetas y un componente a su texto. Una tabla que se cambia por
// otra cosa se pierde, pero Ctrl+Z la devuelve. Un componente nuevo arranca como imagen; el de un
// componente a HTML lo arma el store, que tiene con que dibujar el texto vertical.
export function setCellContentKind(
  design: PdfDesign,
  cellId: string,
  kind: PdfCellContentKind,
): PdfDesign {
  const location = findCell(design, cellId)
  if (!location || location.cell.content.kind === kind) return design
  if (kind === 'table' && location.depth >= PDF_MAX_TABLE_DEPTH) return design

  const content: PdfCellContent = convertContent(location.cell.content, kind)
  return mapCell(design, cellId, (cell) => ({ ...cell, content }))
}

function convertContent(current: PdfCellContent, kind: PdfCellContentKind): PdfCellContent {
  switch (kind) {
    case 'table':
      return { kind, table: createTable(PDF_NEW_TABLE_SIZE.columns, PDF_NEW_TABLE_SIZE.rows) }
    case 'component':
      return { kind, component: createPdfComponent('image') }
    case 'html':
      return { kind, html: current.kind === 'text' ? escapeHtml(current.text) : '' }
    case 'text':
      if (current.kind === 'html') return { kind, text: stripTags(current.html) }
      if (current.kind === 'component') return { kind, text: pdfComponentText(current.component) }
      return { kind, text: '' }
  }
}

export function addSheet(design: PdfDesign): PdfDesign {
  return { ...design, sheets: [...design.sheets, { id: uuidv4(), blocks: [] }] }
}

// La ultima hoja no se quita: un diseño sin hojas no tiene donde pintarse.
export function removeSheet(design: PdfDesign, sheetId: string): PdfDesign {
  if (design.sheets.length <= 1 || !design.sheets.some((sheet) => sheet.id === sheetId))
    return design
  return { ...design, sheets: design.sheets.filter((sheet) => sheet.id !== sheetId) }
}

export function addBlock(design: PdfDesign, sheetId: string, kind: PdfBlock['kind']): PdfDesign {
  const block: PdfBlock =
    kind === 'table'
      ? { ...createTable(PDF_NEW_TABLE_SIZE.columns, PDF_NEW_TABLE_SIZE.rows), kind: 'table' }
      : { kind: 'html', id: uuidv4(), html: '' }

  return mapSheet(design, sheetId, (sheet) => ({ ...sheet, blocks: [...sheet.blocks, block] }))
}

export function removeBlock(design: PdfDesign, blockId: string): PdfDesign {
  const location = findBlock(design, blockId)
  if (!location) return design

  return mapSheet(design, location.sheetId, (sheet) => ({
    ...sheet,
    blocks: sheet.blocks.filter((block) => block.id !== blockId),
  }))
}

// Sube o baja un bloque. En el borde de su hoja pasa a la vecina -- al final de la anterior o al
// principio de la siguiente --, asi el orden del documento se mantiene: es como se parte en hojas
// una plantilla vieja que entro entera en la hoja 1. En el borde del documento no hace nada.
export function moveBlock(design: PdfDesign, blockId: string, offset: -1 | 1): PdfDesign {
  const sheetIndex: number = design.sheets.findIndex((sheet) =>
    sheet.blocks.some((block) => block.id === blockId),
  )
  if (sheetIndex === -1) return design

  const sheet: PdfSheet = design.sheets[sheetIndex]
  const from: number = sheet.blocks.findIndex((block) => block.id === blockId)
  const to: number = from + offset

  if (to >= 0 && to < sheet.blocks.length) {
    const blocks: PdfBlock[] = [...sheet.blocks]
    const [moved] = blocks.splice(from, 1)
    blocks.splice(to, 0, moved)
    return mapSheet(design, sheet.id, (current) => ({ ...current, blocks }))
  }

  const neighbor: PdfSheet | undefined = design.sheets[sheetIndex + offset]
  if (!neighbor) return design

  const moved: PdfBlock = sheet.blocks[from]
  const sheets: PdfSheet[] = design.sheets.map((current) => {
    if (current.id === sheet.id)
      return { ...current, blocks: current.blocks.filter((block) => block.id !== blockId) }
    if (current.id === neighbor.id)
      return {
        ...current,
        blocks: offset === 1 ? [moved, ...current.blocks] : [...current.blocks, moved],
      }
    return current
  })
  return { ...design, sheets }
}

export function canMoveBlock(design: PdfDesign, blockId: string, offset: -1 | 1): boolean {
  return moveBlock(design, blockId, offset) !== design
}

export function setHtmlBlock(design: PdfDesign, blockId: string, html: string): PdfDesign {
  return mapBlocks(design, (block) =>
    block.id === blockId && block.kind === 'html' && block.html !== html
      ? { ...block, html }
      : block,
  )
}

// Las celdas del rectangulo seleccionado (una sola si ancla y foco coinciden). Vacio sin seleccion
// de celdas. La usan el lienzo, para pintarla, y el store, para aplicarle un estilo.
export function selectedCellIds(design: PdfDesign, selection: PdfSelection | null): string[] {
  if (selection?.kind !== 'cells') return []

  const table: PdfTable | undefined = findTable(design, selection.tableId)?.table
  if (!table) return []
  const rect: PdfGridRect | null = selectionRect(
    table,
    selection.anchorCellId,
    selection.focusCellId,
  )
  return rect ? cellsInRect(table, rect) : []
}

// La celda que lleva adentro a la tabla `tableId`; null si la tabla es suelta o no existe.
export function findTableOwner(design: PdfDesign, tableId: string): string | null {
  const location: PdfTableLocation | null = findTable(design, tableId)
  if (!location || location.depth === 1) return null

  let owner: string | null = null
  const visit = (table: PdfTable): void => {
    for (const row of table.rows) {
      for (const cell of row.cells) {
        if (cell.content.kind !== 'table') continue
        if (cell.content.table.id === tableId) owner = cell.id
        else visit(cell.content.table)
      }
    }
  }
  for (const sheet of design.sheets) {
    for (const block of sheet.blocks) if (block.kind === 'table') visit(block)
  }
  return owner
}

// La hoja donde vive una tabla suelta, un bloque o una celda (para saber a que hoja se agrega).
export function sheetOf(design: PdfDesign, id: string): string | null {
  return (
    findBlock(design, id)?.sheetId ??
    findTable(design, id)?.sheetId ??
    findCell(design, id)?.sheetId ??
    null
  )
}

function mapSheet(
  design: PdfDesign,
  sheetId: string,
  fn: (sheet: PdfSheet) => PdfSheet,
): PdfDesign {
  let changed: boolean = false
  const sheets: PdfSheet[] = design.sheets.map((sheet) => {
    if (sheet.id !== sheetId) return sheet
    const next: PdfSheet = fn(sheet)
    if (next !== sheet) changed = true
    return next
  })
  return changed ? { ...design, sheets } : design
}

function mapBlocks(design: PdfDesign, fn: (block: PdfBlock) => PdfBlock): PdfDesign {
  let changed: boolean = false
  const sheets: PdfSheet[] = design.sheets.map((sheet) => {
    let sheetChanged: boolean = false
    const blocks: PdfBlock[] = sheet.blocks.map((block) => {
      const next: PdfBlock = fn(block)
      if (next !== block) sheetChanged = true
      return next
    })
    if (!sheetChanged) return sheet
    changed = true
    return { ...sheet, blocks }
  })
  return changed ? { ...design, sheets } : design
}

// undefined borra la clave; un valor igual al que ya tiene no cambia nada (misma referencia).
// NoInfer: T sale del objeto, no del parche (si no, T se deduce como el tipo del parche).
function applyPatch<T extends object>(target: T, patch: Partial<NoInfer<T>>): T {
  const next: Record<string, unknown> = { ...(target as Record<string, unknown>) }
  let changed: boolean = false

  for (const [key, value] of Object.entries(patch)) {
    const current: unknown = next[key]
    if (value === undefined) {
      if (key in next) {
        delete next[key]
        changed = true
      }
    } else if (JSON.stringify(current) !== JSON.stringify(value)) {
      next[key] = value
      changed = true
    }
  }

  return changed ? (next as T) : target
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
