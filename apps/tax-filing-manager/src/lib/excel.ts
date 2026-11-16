// Excel (.xlsx) de una hoja sin librerías: un .xlsx es un zip de XML. Alcanza para generar
// una plantilla y leerla de vuelta cuando el usuario la llena en Excel.
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'

const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const NS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const NS_PAQUETE = 'http://schemas.openxmlformats.org/package/2006/relationships'
const KIND = 'application/vnd.openxmlformats-officedocument.spreadsheetml'

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** 0 → A, 25 → Z, 26 → AA. */
function columnLetter(index: number) {
  let letters = ''
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26))
    letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters
  return letters
}

/** "C12" → 2. */
const columnIndex = (reference: string) =>
  [...(/^[A-Z]+/.exec(reference)?.[0] ?? 'A')].reduce(
    (n, letter) => n * 26 + letter.charCodeAt(0) - 64,
    0,
  ) - 1

interface Sheet {
  name: string
  /** Primera fila: encabezados, en negrilla y fijos al desplazarse. */
  rows: (string | number)[][]
  /** Ancho de cada columna, en caracteres. */
  widths: number[]
  /** Columnas con formato de texto, para que Excel no le quite los ceros a la izquierda a un código. */
  textColumns?: number[]
  /** Columnas de valores en pesos, con separador de miles. */
  pesoColumns?: number[]
  /** Lista desplegable con los valores permitidos en una columna. */
  list?: { column: number; values: string[] }
}

// Estilos: 0 normal, 1 encabezado en negrilla, 2 texto (formato @), 3 miles (formato #,##0).
const STYLES = `<styleSheet xmlns="${NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>`

export function createXlsx({
  name,
  rows,
  widths,
  textColumns = [],
  pesoColumns = [],
  list,
}: Sheet) {
  const cell = (value: string | number, row: number, column: number) => {
    const style =
      row === 0 ? 1 : textColumns.includes(column) ? 2 : pesoColumns.includes(column) ? 3 : 0
    const attributes = `r="${columnLetter(column)}${row + 1}"${style ? ` s="${style}"` : ''}`
    return typeof value === 'number'
      ? `<c ${attributes}><v>${value}</v></c>`
      : `<c ${attributes} t="inlineStr"><is><t xml:space="preserve">${escape(value)}</t></is></c>`
  }
  const columns = widths
    .map(
      (width, i) =>
        `<col min="${i + 1}" max="${i + 1}" width="${width}" customWidth="1"${textColumns.includes(i) ? ' style="2"' : ''}/>`,
    )
    .join('')
  const data = rows
    .map((row, f) => `<row r="${f + 1}">${row.map((value, c) => cell(value, f, c)).join('')}</row>`)
    .join('')
  const validation = list
    ? `<dataValidations count="1"><dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="${columnLetter(list.column)}2:${columnLetter(list.column)}2000"><formula1>"${escape(list.values.join(','))}"</formula1></dataValidation></dataValidations>`
    : ''
  const sheet = `<worksheet xmlns="${NS}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${columns}</cols><sheetData>${data}</sheetData>${validation}</worksheet>`

  const xml = (content: string) =>
    strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${content}`)
  const zip = zipSync({
    '[Content_Types].xml': xml(
      `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${KIND}.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="${KIND}.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="${KIND}.styles+xml"/></Types>`,
    ),
    '_rels/.rels': xml(
      `<Relationships xmlns="${NS_PAQUETE}"><Relationship Id="rId1" Type="${NS_REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ),
    'xl/workbook.xml': xml(
      `<workbook xmlns="${NS}" xmlns:r="${NS_REL}"><sheets><sheet name="${escape(name)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    ),
    'xl/_rels/workbook.xml.rels': xml(
      `<Relationships xmlns="${NS_PAQUETE}"><Relationship Id="rId1" Type="${NS_REL}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${NS_REL}/styles" Target="styles.xml"/></Relationships>`,
    ),
    'xl/worksheets/sheet1.xml': xml(sheet),
    'xl/styles.xml': xml(STYLES),
  })
  return new Blob([zip as Uint8Array<ArrayBuffer>], {
    type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
  })
}

/** Filas de la primera hoja, como texto, con su número de fila en Excel. Lanza un error si no es un .xlsx. */
export function readXlsx(data: Uint8Array): { number: number; cells: string[] }[] {
  const files = unzipSync(data)
  const read = (path: string) => {
    const content = files[path]
    return content
      ? new DOMParser().parseFromString(strFromU8(content), 'application/xml')
      : undefined
  }
  const all = (node: Document | Element | undefined, label: string) =>
    node ? [...node.getElementsByTagNameNS('*', label)] : []
  const text = (node: Element) =>
    all(node, 't')
      .map((t) => t.textContent ?? '')
      .join('')

  const workbook = read('xl/workbook.xml')
  if (!workbook) throw new Error('No es un libro de Excel')
  // Primera hoja del libro, siguiendo su relación hasta el archivo que la guarda.
  const sheetId = [...(all(workbook, 'sheet')[0]?.attributes ?? [])].find(
    (a) => a.localName === 'id',
  )?.value
  const destination =
    all(read('xl/_rels/workbook.xml.rels'), 'Relationship')
      .find((r) => r.getAttribute('Id') === sheetId)
      ?.getAttribute('Target') ?? 'worksheets/sheet1.xml'
  const sheet = read(destination.startsWith('/') ? destination.slice(1) : `xl/${destination}`)
  const shared = all(read('xl/sharedStrings.xml'), 'si').map(text)

  return all(sheet, 'row').map((row, i) => {
    const cells: string[] = []
    all(row, 'c').forEach((c, j) => {
      const reference = c.getAttribute('r')
      const value = all(c, 'v')[0]?.textContent ?? ''
      const kind = c.getAttribute('t')
      cells[reference ? columnIndex(reference) : j] =
        kind === 's' ? (shared[Number(value)] ?? '') : kind === 'inlineStr' ? text(c) : value
    })
    return {
      number: Number(row.getAttribute('r')) || i + 1,
      cells: Array.from(cells, (c) => c ?? ''),
    }
  })
}
