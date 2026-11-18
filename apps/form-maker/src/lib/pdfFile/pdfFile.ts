import { v4 as uuidv4 } from 'uuid'
import {
  PDF_DEFAULT_FONT,
  PDF_DEFAULT_FONT_SIZE,
  PDF_FONT_OPTIONS,
  PDF_COMPONENT_ATTRIBUTE,
  PDF_MAX_TABLE_DEPTH,
  PDF_TABLE_CLASS,
  PDF_WEB_PAGE_WIDTH_PX,
} from '../../constants'
import type {
  CssStyleMap,
  PdfBlock,
  PdfCell,
  PdfCellContent,
  PdfClass,
  PdfColumn,
  PdfComponent,
  PdfComponentContext,
  PdfDesign,
  PdfFileRead,
  PdfFontFamily,
  PdfHtmlElement,
  PdfHtmlNode,
  PdfMargins,
  PdfRow,
  PdfSheet,
  PdfTable,
  PdfTaxType,
  PdfVerticalTextRenderer,
} from '../../types'
import { pdfComponentHtml } from '../pdfComponents'
import {
  cellStyleMap,
  createBlankDesign,
  createBlankSheet,
  documentStyleMap,
  isPdfTaxType,
  mmToPx,
  normalizeMargins,
  pdfClassTokens,
  pdfStyleSheet,
  sheetEdgeStyleMap,
  tableStyleMap,
  taxTypeLabel,
} from '../pdfDesign'
import { parsePdfClasses, parsePdfComponent, parsePdfDesign } from '../pdfDesignBank'
import {
  escapePdfText,
  normalizePdfHtml,
  parsePdfHtml,
  pdfHtmlAttribute,
  pdfHtmlText,
  sanitizePdfHtml,
  serializePdfHtml,
} from '../pdfHtml'
import { normalizeTable } from '../pdfTable'
import {
  BASE_CSS,
  CELL_PROP_KEYS,
  FILE_ATTR,
  FILE_COMMENT,
  MESSAGES,
  PDF_FILE_FORMAT_VERSION,
  UNSAFE_INPUT,
} from './pdfFile.constants'
import {
  attrs,
  collectVariables,
  cssText,
  elementChildren,
  findElement,
  hasAttribute,
  isBlank,
  legacyWarnings,
  list,
  positiveInt,
  px,
  pxFromStyle,
  safeJson,
  versionFromFileName,
} from './pdfFile.utils'

// El .html del PDF: lo genera para publicar y lo lee para abrir (docs/Pendientes-PDF.md §3.5). Es
// la unica fuente del diseño: no hay un JSON aparte, y lo que hace falta para reabrirlo viaja en
// atributos data-fm-*, que SelectPdf ignora.
//
// El generador pinta lo mismo que el lienzo: las mismas funciones de estilo (tableStyleMap,
// cellStyleMap, documentStyleMap) y el mismo HTML libre, saneado y con sus etiquetas cerradas.
// Solo tablas y bloques: ni scripts, ni flex, ni grid. Sin React ni store, y fuera de lib/index.ts:
// solo lo usa el diseñador, que se carga con React.lazy.

export function pdfFileName(taxType: PdfTaxType, version: number): string {
  return `${taxType}_v${version}.html`
}

// renderVerticalText dibuja el PNG del texto vertical: necesita un <canvas>, que esta lib no toca
// (lib/pdfVerticalText lo hace en el navegador). Sin el, el texto vertical sale con writing-mode.
export function buildPdfHtml(
  design: PdfDesign,
  version: number,
  renderVerticalText: PdfVerticalTextRenderer = () => null,
): string {
  const ctx: PdfComponentContext = {
    mode: 'file',
    fontFamily: design.fontFamily,
    renderVerticalText,
  }
  const rootStyle: CssStyleMap = {
    boxSizing: 'border-box',
    width: `${PDF_WEB_PAGE_WIDTH_PX}px`,
    paddingLeft: px(mmToPx(design.margins.left)),
    paddingRight: px(mmToPx(design.margins.right)),
    ...documentStyleMap(design),
  }
  const { top, right, bottom, left } = design.margins
  const rootAttributes: string = attrs([
    [FILE_ATTR.design, String(PDF_FILE_FORMAT_VERSION)],
    [FILE_ATTR.tax, design.taxType],
    [FILE_ATTR.version, String(version)],
    [FILE_ATTR.font, design.fontFamily],
    [FILE_ATTR.fontSize, String(design.fontSize)],
    [FILE_ATTR.margins, `${top} ${right} ${bottom} ${left}`],
    [FILE_ATTR.classes, design.classes.length > 0 ? JSON.stringify(design.classes) : null],
    ['style', cssText(rootStyle)],
  ])

  return [
    '<!DOCTYPE html>',
    '<html lang="es">',
    '<head>',
    '<meta charset="utf-8">',
    `<title>${escapePdfText(taxTypeLabel(design.taxType))} v${version}</title>`,
    `<style>\n${BASE_CSS}\n${pdfStyleSheet(design)}\n</style>`,
    '</head>',
    '<body>',
    FILE_COMMENT,
    `<div${rootAttributes}>`,
    ...design.sheets.map((sheet, index) => writeSheet(sheet, index, design.margins, ctx)),
    '</div>',
    '</body>',
    '</html>',
    '',
  ].join('\n')
}

// Un archivo FormMaker se reabre tal cual; cualquier otro .html es una plantilla vieja y entra entera
// en la hoja 1 (§2.1, "Plantillas viejas al importar"). Un archivo de FormMaker de otro impuesto no
// se abre: cada impuesto tiene su plantilla. Nunca lanza.
export function readPdfFile(text: string, taxType: PdfTaxType, fileName: string = ''): PdfFileRead {
  const nodes: PdfHtmlNode[] = parsePdfHtml(sanitizePdfHtml(text))
  const warnings: string[] = UNSAFE_INPUT.test(text) ? [MESSAGES.unsafe] : []
  const nameVersion: number | null = versionFromFileName(fileName)

  const root: PdfHtmlElement | null = findElement(nodes, (element) =>
    hasAttribute(element, FILE_ATTR.design),
  )
  return root
    ? readFormMakerFile(root, taxType, nameVersion, warnings)
    : readLegacyFile(nodes, taxType, nameVersion, warnings)
}

// De varios archivos, el que vale: el de N mas alta entre los que se pudieron leer (§3.5). -1 si
// ninguno sirve. A igual N, el primero.
export function pickLatestPdfFile(reads: PdfFileRead[]): number {
  let best: number = -1
  reads.forEach((read, index) => {
    if (!read.ok) return
    const current: PdfFileRead = reads[best] ?? read
    const bestVersion: number = best === -1 || !current.ok ? -1 : (current.version ?? 0)
    if ((read.version ?? 0) > bestVersion) best = index
  })
  return best
}

// Toca el DOM, como downloadFormExport: el resto de este archivo es puro.
export function downloadPdfHtml(html: string, fileName: string): void {
  const blob: Blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url: string = URL.createObjectURL(blob)
  const anchor: HTMLAnchorElement = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

// --- Generador ---

// Cada hoja lleva su relleno arriba y abajo; desde la segunda, un salto de pagina antes (§2.1,
// "Hojas"). Los lados son del contenedor y valen para todas.
function writeSheet(
  sheet: PdfSheet,
  index: number,
  margins: PdfMargins,
  ctx: PdfComponentContext,
): string {
  const style: CssStyleMap = {
    paddingTop: px(mmToPx(margins.top)),
    paddingBottom: px(mmToPx(margins.bottom)),
    ...sheetEdgeStyleMap(),
  }
  if (index > 0) style.pageBreakBefore = 'always'

  const blocks: string[] = sheet.blocks.map((block) =>
    block.kind === 'table'
      ? writeTable(block, ctx)
      : `<div${attrs([[FILE_ATTR.block, 'html']])}>${normalizePdfHtml(block.html)}</div>`,
  )
  return [
    `<div${attrs([
      [FILE_ATTR.sheet, String(index + 1)],
      ['style', cssText(style)],
    ])}>`,
    ...blocks,
    '</div>',
  ].join('\n')
}

function writeTable(table: PdfTable, ctx: PdfComponentContext): string {
  const opening: string = `<table${attrs([
    [FILE_ATTR.table, ''],
    [FILE_ATTR.style, table.style || null],
    ['class', [PDF_TABLE_CLASS, ...pdfClassTokens(table.className)].join(' ')],
    ['style', cssText(tableStyleMap(table)) || null],
  ])}>`
  const columns: string = table.columns
    .map((column) => `<col${column.width ? attrs([['style', `width: ${column.width}px`]]) : ''}>`)
    .join('')
  const rows: string[] = table.rows.map((row) => {
    const opening: string = `<tr${row.height ? attrs([['style', `height: ${row.height}px`]]) : ''}>`
    return [opening, ...row.cells.map((cell) => writeCell(cell, ctx)), '</tr>'].join('\n')
  })

  return [
    opening,
    `<colgroup>${columns}</colgroup>`,
    '<tbody>',
    ...rows,
    '</tbody>',
    '</table>',
  ].join('\n')
}

function writeCell(cell: PdfCell, ctx: PdfComponentContext): string {
  const props: Record<string, unknown> = {}
  for (const key of CELL_PROP_KEYS) if (cell[key] !== undefined) props[key] = cell[key]

  // Solo lo que la celda tiene propio: lo comun va en sus clases y en el <style>. El texto, que es lo
  // mas frecuente, no se marca (el lector lo da por defecto).
  const className: string = pdfClassTokens(cell.className).join(' ')
  const opening: string = `<td${attrs([
    ['colspan', cell.colSpan > 1 ? String(cell.colSpan) : null],
    ['rowspan', cell.rowSpan > 1 ? String(cell.rowSpan) : null],
    [FILE_ATTR.cell, cell.content.kind === 'text' ? null : cell.content.kind],
    [FILE_ATTR.props, Object.keys(props).length > 0 ? JSON.stringify(props) : null],
    [FILE_ATTR.style, cell.style || null],
    ['class', className || null],
    ['style', cssText(cellStyleMap(cell)) || null],
  ])}>`

  return `${opening}${writeCellContent(cell.content, ctx)}</td>`
}

// Igual que el lienzo: una celda vacia lleva un espacio duro, o la fila se aplasta. El componente
// pasa por el mismo saneo que el HTML libre: un src que no es seguro se cae ahi.
function writeCellContent(content: PdfCellContent, ctx: PdfComponentContext): string {
  if (content.kind === 'table') return `\n${writeTable(content.table, ctx)}\n`
  if (content.kind === 'component') {
    return normalizePdfHtml(pdfComponentHtml(content.component, ctx)) || '&nbsp;'
  }
  if (content.kind === 'html') return normalizePdfHtml(content.html) || '&nbsp;'
  return content.text === '' ? '&nbsp;' : escapePdfText(content.text)
}

// --- Lector de archivos de FormMaker ---

function readFormMakerFile(
  root: PdfHtmlElement,
  taxType: PdfTaxType,
  nameVersion: number | null,
  warnings: string[],
): PdfFileRead {
  const format: number | null = positiveInt(pdfHtmlAttribute(root, FILE_ATTR.design))
  if (format === null) return { ok: false, error: MESSAGES.badFormat }
  if (format > PDF_FILE_FORMAT_VERSION) return { ok: false, error: MESSAGES.newer }

  const tax: string | null = pdfHtmlAttribute(root, FILE_ATTR.tax)
  if (!isPdfTaxType(tax)) return { ok: false, error: MESSAGES.unknownTax }
  if (tax !== taxType) {
    return {
      ok: false,
      error: `Este archivo es la plantilla de ${taxTypeLabel(tax)}. Ábrelo desde un formulario de ${taxTypeLabel(tax)}: cada impuesto tiene la suya.`,
    }
  }

  const sheets: PdfSheet[] = []
  let hasStray: boolean = false
  for (const node of root.children) {
    if (node.type === 'element' && hasAttribute(node, FILE_ATTR.sheet)) {
      sheets.push(readSheet(node, () => (hasStray = true)))
    } else if (!isBlank([node])) {
      hasStray = true
    }
  }
  if (hasStray) warnings.push(MESSAGES.stray)

  const fontFamily: PdfFontFamily = readFont(pdfHtmlAttribute(root, FILE_ATTR.font), warnings)
  const fontSize: number = readFontSize(pdfHtmlAttribute(root, FILE_ATTR.fontSize), warnings)
  const design: PdfDesign | null = parsePdfDesign({
    taxType: tax,
    fontFamily,
    fontSize,
    margins: readMargins(pdfHtmlAttribute(root, FILE_ATTR.margins)),
    classes: readClasses(pdfHtmlAttribute(root, FILE_ATTR.classes), warnings),
    sheets: sheets.length > 0 ? sheets : [createBlankSheet()],
  })
  if (!design) return { ok: false, error: MESSAGES.damaged }

  const version: number | null =
    positiveInt(pdfHtmlAttribute(root, FILE_ATTR.version)) ?? nameVersion
  return { ok: true, source: 'formmaker', design, version, warnings }
}

function readSheet(element: PdfHtmlElement, onStray: () => void): PdfSheet {
  const blocks: PdfBlock[] = []
  for (const node of element.children) {
    if (node.type === 'text') {
      if (node.text.trim() !== '') {
        onStray()
        blocks.push({ kind: 'html', id: uuidv4(), html: node.text.trim() })
      }
      continue
    }
    if (hasAttribute(node, FILE_ATTR.table)) {
      blocks.push({ ...readTable(node, 1), kind: 'table' })
    } else if (hasAttribute(node, FILE_ATTR.block)) {
      blocks.push({ kind: 'html', id: uuidv4(), html: serializePdfHtml(node.children) })
    } else {
      onStray()
      blocks.push({ kind: 'html', id: uuidv4(), html: serializePdfHtml([node]) })
    }
  }
  return { id: uuidv4(), blocks }
}

// Lee filas y columnas como vengan (con o sin <tbody>) y deja la tabla sana con normalizeTable:
// una celda agregada o borrada a mano se arregla igual que en el lienzo.
function readTable(element: PdfHtmlElement, depth: number): PdfTable {
  const columns: PdfColumn[] = []
  const rows: PdfRow[] = []

  const readCol = (col: PdfHtmlElement): void => {
    const width: number | undefined = pxFromStyle(pdfHtmlAttribute(col, 'style'), 'width')
    columns.push(width ? { id: uuidv4(), width } : { id: uuidv4() })
  }
  const readRow = (tr: PdfHtmlElement): void => {
    const height: number | undefined = pxFromStyle(pdfHtmlAttribute(tr, 'style'), 'height')
    const cells: PdfCell[] = elementChildren(tr)
      .filter((child) => child.name === 'td' || child.name === 'th')
      .map((child) => readCell(child, depth))
    rows.push(height ? { id: uuidv4(), height, cells } : { id: uuidv4(), cells })
  }

  for (const child of elementChildren(element)) {
    if (child.name === 'colgroup') elementChildren(child).filter(isCol).forEach(readCol)
    else if (child.name === 'col') readCol(child)
    else if (child.name === 'tr') readRow(child)
    else if (child.name === 'thead' || child.name === 'tbody' || child.name === 'tfoot') {
      elementChildren(child)
        .filter((row) => row.name === 'tr')
        .forEach(readRow)
    }
  }
  if (rows.length === 0 || rows.every((row) => row.cells.length === 0)) {
    rows.splice(0, rows.length, { id: uuidv4(), cells: [textCell('')] })
  }

  const table: PdfTable = { id: uuidv4(), columns, rows }
  // La clase de las tablas del editor la pone el generador: no es del autor.
  const className: string = pdfClassTokens(pdfHtmlAttribute(element, 'class') ?? '')
    .filter((token) => token !== PDF_TABLE_CLASS)
    .join(' ')
  const style: string | null = pdfHtmlAttribute(element, FILE_ATTR.style)
  if (className) table.className = className
  if (style) table.style = style
  return normalizeTable(table)
}

function readCell(element: PdfHtmlElement, depth: number): PdfCell {
  const cell: PdfCell = {
    id: uuidv4(),
    colSpan: positiveInt(pdfHtmlAttribute(element, 'colspan')) ?? 1,
    rowSpan: positiveInt(pdfHtmlAttribute(element, 'rowspan')) ?? 1,
    content: readCellContent(element, depth),
  }

  // El esquema valida cada propiedad despues; aca solo se toman las que existen.
  const props: Record<string, unknown> = safeJson(pdfHtmlAttribute(element, FILE_ATTR.props))
  for (const key of CELL_PROP_KEYS) {
    if (props[key] !== undefined) (cell as unknown as Record<string, unknown>)[key] = props[key]
  }
  const className: string | null = pdfHtmlAttribute(element, 'class')
  const style: string | null = pdfHtmlAttribute(element, FILE_ATTR.style)
  if (className) cell.className = className
  if (style) cell.style = style
  return cell
}

// Lo que dice data-fm-cell, con una salida para lo editado a mano: una celda de texto que ahora trae
// etiquetas pasa a HTML (no se pierden), y una tabla mas honda que el tope queda como HTML.
function readCellContent(element: PdfHtmlElement, depth: number): PdfCellContent {
  const kind: string | null = pdfHtmlAttribute(element, FILE_ATTR.cell)

  // Un componente se rearma desde su data-fm-config; si alguien lo daño a mano, queda como HTML.
  if (kind === 'component') {
    const component: PdfComponent | null = readComponent(element)
    if (component) return { kind: 'component', component }
  }

  const nested: PdfHtmlElement | undefined = elementChildren(element).find(
    (child) => child.name === 'table',
  )
  if ((kind === 'table' || kind === null) && nested && depth < PDF_MAX_TABLE_DEPTH) {
    return { kind: 'table', table: readTable(nested, depth + 1) }
  }

  const hasElements: boolean = element.children.some((child) => child.type === 'element')
  if (kind === 'html' || kind === 'table' || hasElements) {
    const html: string = serializePdfHtml(element.children).trim()
    return { kind: 'html', html: html === '&nbsp;' ? '' : html }
  }

  const text: string = pdfHtmlText(element.children)
  return { kind: 'text', text: text === ' ' ? '' : text }
}

// El tipo y la configuracion salen de los data-fm-* del elemento de afuera del componente; la imagen
// (imagen y sello), del primer <img>, que es donde va el base64 una sola vez. Lo de adentro no se
// lee: se vuelve a generar, asi que un cambio a mano dentro de un componente no sobrevive.
function readComponent(cell: PdfHtmlElement): PdfComponent | null {
  const root: PdfHtmlElement | null = findElement(cell.children, (child) =>
    hasAttribute(child, PDF_COMPONENT_ATTRIBUTE.type),
  )
  if (!root) return null

  const type: string | null = pdfHtmlAttribute(root, PDF_COMPONENT_ATTRIBUTE.type)
  const config: Record<string, unknown> = safeJson(
    pdfHtmlAttribute(root, PDF_COMPONENT_ATTRIBUTE.config),
  )
  const value: Record<string, unknown> = { ...config, type }
  if (type === 'image' || type === 'stamp') {
    const image: PdfHtmlElement | null = findElement([root], (child) => child.name === 'img')
    value.src = (image && pdfHtmlAttribute(image, 'src')) ?? ''
  }
  return parsePdfComponent(value)
}

function readFont(value: string | null, warnings: string[]): PdfFontFamily {
  const found = PDF_FONT_OPTIONS.find((option) => option.family === value)
  if (found) return found.family
  warnings.push(MESSAGES.font)
  return PDF_DEFAULT_FONT
}

function readFontSize(value: string | null, warnings: string[]): number {
  const size: number = Number(value)
  if (value !== null && Number.isFinite(size) && size > 0) return size
  warnings.push(MESSAGES.fontSize)
  return PDF_DEFAULT_FONT_SIZE
}

// Las clases salen de data-fm-classes, no del <style> del <head>: ese lo vuelve a escribir el
// generador, asi que un cambio a mano ahi no sobrevive (igual que el style de una celda).
function readClasses(value: string | null, warnings: string[]): PdfClass[] {
  if (!value) return []
  let raw: unknown
  try {
    raw = JSON.parse(value)
  } catch {
    warnings.push(MESSAGES.classes)
    return []
  }
  const classes: PdfClass[] = parsePdfClasses(raw)
  if (!Array.isArray(raw) || classes.length < raw.length) warnings.push(MESSAGES.classes)
  return classes
}

function readMargins(value: string | null): PdfMargins {
  const [top, right, bottom, left] = (value ?? '').trim().split(/\s+/).map(Number)
  return normalizeMargins({ top, right, bottom, left })
}

// --- Lector de plantillas viejas ---

// Entra entera en la hoja 1, sin adivinar donde cortar: cada tabla de primer nivel es su bloque, y
// lo que hay entre tablas, otro. Asi se puede partir en hojas bajando bloques (moveBlock pasa a la
// hoja siguiente en el borde). Se pinta como venia, porque pasarla a tablas del editor cambiaria lo
// que se ve: el CSS de sus clases perderia contra los estilos en linea del diseñador.
function readLegacyFile(
  nodes: PdfHtmlNode[],
  taxType: PdfTaxType,
  nameVersion: number | null,
  warnings: string[],
): PdfFileRead {
  const blocks: PdfBlock[] = []
  let run: PdfHtmlNode[] = []
  const flush = (): void => {
    const html: string = serializePdfHtml(run).trim()
    if (html) blocks.push({ kind: 'html', id: uuidv4(), html })
    run = []
  }
  for (const node of nodes) {
    if (node.type === 'element' && node.name === 'table') {
      flush()
      blocks.push({ kind: 'html', id: uuidv4(), html: serializePdfHtml([node]) })
    } else {
      run.push(node)
    }
  }
  flush()
  if (blocks.length === 0) return { ok: false, error: MESSAGES.empty }

  const variables: string[] = collectVariables(serializePdfHtml(nodes))
  const summary: string[] = [
    `Plantilla hecha a mano: entró en la hoja 1 como ${blocks.length} ${
      blocks.length === 1 ? 'bloque' : 'bloques'
    } de HTML. Si no cabe, la hoja lo avisa: agrega una hoja con «+ Hoja» y baja ahí los bloques del final con «Bajar».`,
  ]
  if (variables.length > 0) {
    summary.push(`Trae ${variables.length} variables distintas: ${list(variables, 8)}.`)
  }

  const design: PdfDesign = {
    ...createBlankDesign(taxType),
    sheets: [{ id: uuidv4(), blocks }],
  }
  return {
    ok: true,
    source: 'legacy',
    design,
    version: nameVersion,
    warnings: [...summary, ...warnings, ...legacyWarnings(nodes)],
  }
}

function textCell(text: string): PdfCell {
  return { id: uuidv4(), colSpan: 1, rowSpan: 1, content: { kind: 'text', text } }
}

function isCol(element: PdfHtmlElement): boolean {
  return element.name === 'col'
}
