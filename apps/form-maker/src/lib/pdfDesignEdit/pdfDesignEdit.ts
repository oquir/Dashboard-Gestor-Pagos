import { v4 as uuidv4 } from 'uuid'
import {
  PDF_MAX_TABLE_DEPTH,
  PDF_NEW_TABLE_SIZE,
  PDF_STYLE_KEYS as STYLE_KEYS,
} from '../../constants'
import type {
  PdfBlock,
  PdfCell,
  PdfCellContent,
  PdfCellContentKind,
  PdfCellStylePatch,
  PdfClass,
  PdfClassPatch,
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
import { isValidPdfClassName, pdfClassTokens } from '../pdfDesign'
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

// --- Clases del diseño ---

// El primer "claseN" libre, para una clase recien creada que despues se renombra.
export function nextClassName(design: PdfDesign): string {
  const used: Set<string> = new Set(design.classes.map((item) => item.name))
  let index: number = design.classes.length + 1
  while (used.has(`clase${index}`)) index++
  return `clase${index}`
}

export function addClass(design: PdfDesign, item: PdfClass): PdfDesign {
  if (!isValidPdfClassName(item.name) || design.classes.some((c) => c.name === item.name))
    return design
  return { ...design, classes: [...design.classes, item] }
}

export function updateClass(design: PdfDesign, name: string, patch: PdfClassPatch): PdfDesign {
  let changed: boolean = false
  const classes: PdfClass[] = design.classes.map((item) => {
    if (item.name !== name) return item
    const next: PdfClass = applyPatch(item, patch)
    if (next !== item) changed = true
    return next
  })
  return changed ? { ...design, classes } : design
}

// Cambia el nombre en la clase y en cada celda que la lleva. Un nombre invalido o ya usado no hace
// nada: la barra lateral lo avisa antes.
export function renameClass(design: PdfDesign, from: string, to: string): PdfDesign {
  if (from === to || !isValidPdfClassName(to)) return design
  if (!design.classes.some((item) => item.name === from)) return design
  if (design.classes.some((item) => item.name === to)) return design

  const renamed: PdfDesign = {
    ...design,
    classes: design.classes.map((item) => (item.name === from ? { ...item, name: to } : item)),
  }
  return mapAllCells(renamed, (cell) =>
    replaceToken(cell, (tokens) => tokens.map((token) => (token === from ? to : token))),
  )
}

// Quita la clase y la saca de las celdas que la llevan: un nombre suelto sin regla no sirve de nada.
export function removeClass(design: PdfDesign, name: string): PdfDesign {
  if (!design.classes.some((item) => item.name === name)) return design
  const removed: PdfDesign = {
    ...design,
    classes: design.classes.filter((item) => item.name !== name),
  }
  return mapAllCells(removed, (cell) =>
    replaceToken(cell, (tokens) => tokens.filter((token) => token !== name)),
  )
}

// Pone o quita una clase en varias celdas, sin tocar sus otras clases.
export function setCellsClass(
  design: PdfDesign,
  cellIds: string[],
  name: string,
  on: boolean,
): PdfDesign {
  const ids: Set<string> = new Set(cellIds)
  return mapAllCells(design, (cell) =>
    ids.has(cell.id)
      ? replaceToken(cell, (tokens) =>
          on
            ? tokens.includes(name)
              ? tokens
              : [...tokens, name]
            : tokens.filter((token) => token !== name),
        )
      : cell,
  )
}

// "Nueva clase con este estilo": la clase toma lo propio de la celda del foco (botones y estilos en
// linea) y se pone en todas las seleccionadas, que sueltan lo que ahora les da la clase. Lo que una
// celda tenga distinto se le queda, encima de la clase.
export function createClassFromCell(
  design: PdfDesign,
  cellIds: string[],
  focusCellId: string,
  name: string,
): PdfDesign {
  const focus: PdfCell | undefined = findCell(design, focusCellId)?.cell
  if (!focus || !isValidPdfClassName(name) || design.classes.some((c) => c.name === name))
    return design

  const item: PdfClass = { name }
  for (const key of STYLE_KEYS) {
    if (focus[key] !== undefined) (item as unknown as Record<string, unknown>)[key] = focus[key]
  }
  if (focus.style?.trim()) item.css = focus.style

  const ids: Set<string> = new Set(cellIds)
  const withClass: PdfDesign = { ...design, classes: [...design.classes, item] }
  return mapAllCells(withClass, (cell) => {
    if (!ids.has(cell.id)) return cell
    const next: Record<string, unknown> = { ...cell }
    for (const key of STYLE_KEYS) {
      if (JSON.stringify(cell[key]) === JSON.stringify(item[key])) delete next[key]
    }
    if (item.css !== undefined && cell.style === item.css) delete next.style
    const tokens: string[] = pdfClassTokens(cell.className)
    next.className = [...tokens.filter((token) => token !== name), name].join(' ')
    return next as unknown as PdfCell
  })
}

// En cuantas celdas esta cada clase, para que el editor diga a cuantas toca un cambio.
export function classUsage(design: PdfDesign): Map<string, number> {
  const usage: Map<string, number> = new Map()
  const visit = (table: PdfTable): void => {
    for (const row of table.rows) {
      for (const cell of row.cells) {
        for (const token of pdfClassTokens(cell.className)) {
          usage.set(token, (usage.get(token) ?? 0) + 1)
        }
        if (cell.content.kind === 'table') visit(cell.content.table)
      }
    }
  }
  for (const sheet of design.sheets) {
    for (const block of sheet.blocks) if (block.kind === 'table') visit(block)
  }
  return usage
}

// Cada celda del diseño, tambien las de tablas anidadas. Lo que no cambia conserva su referencia.
function mapAllCells(design: PdfDesign, fn: (cell: PdfCell) => PdfCell): PdfDesign {
  const mapTableCells = <T extends PdfTable>(table: T): T => {
    let changed: boolean = false
    const rows = table.rows.map((row) => {
      let rowChanged: boolean = false
      const cells: PdfCell[] = row.cells.map((cell) => {
        let next: PdfCell = fn(cell)
        if (next.content.kind === 'table') {
          const inner: PdfTable = mapTableCells(next.content.table)
          if (inner !== next.content.table)
            next = { ...next, content: { kind: 'table', table: inner } }
        }
        if (next !== cell) rowChanged = true
        return next
      })
      if (!rowChanged) return row
      changed = true
      return { ...row, cells }
    })
    return changed ? { ...table, rows } : table
  }
  return mapBlocks(design, (block) => (block.kind === 'table' ? mapTableCells(block) : block))
}

// Reescribe las clases de una celda; sin cambios devuelve la misma celda, y sin clases quita la llave.
function replaceToken(cell: PdfCell, fn: (tokens: string[]) => string[]): PdfCell {
  const tokens: string[] = pdfClassTokens(cell.className)
  const next: string[] = fn(tokens)
  if (next.join(' ') === tokens.join(' ')) return cell
  if (next.length === 0) {
    const rest: PdfCell = { ...cell }
    delete rest.className
    return rest
  }
  return { ...cell, className: next.join(' ') }
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
