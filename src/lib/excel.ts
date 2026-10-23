// Excel (.xlsx) de una hoja sin librerías: un .xlsx es un zip de XML. Alcanza para generar
// una plantilla y leerla de vuelta cuando el usuario la llena en Excel.
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'

const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const NS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const NS_PAQUETE = 'http://schemas.openxmlformats.org/package/2006/relationships'
const TIPO = 'application/vnd.openxmlformats-officedocument.spreadsheetml'

const escapar = (texto: string) => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** 0 → A, 25 → Z, 26 → AA. */
function letraColumna(indice: number) {
  let letras = ''
  for (let n = indice + 1; n > 0; n = Math.floor((n - 1) / 26)) letras = String.fromCharCode(65 + ((n - 1) % 26)) + letras
  return letras
}

/** "C12" → 2. */
const indiceColumna = (referencia: string) => [...(/^[A-Z]+/.exec(referencia)?.[0] ?? 'A')].reduce((n, letra) => n * 26 + letra.charCodeAt(0) - 64, 0) - 1

interface Hoja {
  nombre: string
  /** Primera fila: encabezados, en negrilla y fijos al desplazarse. */
  filas: (string | number)[][]
  /** Ancho de cada columna, en caracteres. */
  anchos: number[]
  /** Columnas con formato de texto, para que Excel no le quite los ceros a la izquierda a un código. */
  columnasTexto?: number[]
  /** Lista desplegable con los valores permitidos en una columna. */
  lista?: { columna: number; valores: string[] }
}

// Estilos: 0 normal, 1 encabezado en negrilla, 2 texto (formato @).
const ESTILOS = `<styleSheet xmlns="${NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>`

export function crearXlsx({ nombre, filas, anchos, columnasTexto = [], lista }: Hoja) {
  const celda = (valor: string | number, fila: number, columna: number) => {
    const estilo = fila === 0 ? 1 : columnasTexto.includes(columna) ? 2 : 0
    const atributos = `r="${letraColumna(columna)}${fila + 1}"${estilo ? ` s="${estilo}"` : ''}`
    return typeof valor === 'number'
      ? `<c ${atributos}><v>${valor}</v></c>`
      : `<c ${atributos} t="inlineStr"><is><t xml:space="preserve">${escapar(valor)}</t></is></c>`
  }
  const columnas = anchos
    .map((ancho, i) => `<col min="${i + 1}" max="${i + 1}" width="${ancho}" customWidth="1"${columnasTexto.includes(i) ? ' style="2"' : ''}/>`)
    .join('')
  const datos = filas.map((fila, f) => `<row r="${f + 1}">${fila.map((valor, c) => celda(valor, f, c)).join('')}</row>`).join('')
  const validacion = lista
    ? `<dataValidations count="1"><dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="${letraColumna(lista.columna)}2:${letraColumna(lista.columna)}2000"><formula1>"${escapar(lista.valores.join(','))}"</formula1></dataValidation></dataValidations>`
    : ''
  const hoja = `<worksheet xmlns="${NS}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${columnas}</cols><sheetData>${datos}</sheetData>${validacion}</worksheet>`

  const xml = (contenido: string) => strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${contenido}`)
  const zip = zipSync({
    '[Content_Types].xml': xml(
      `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${TIPO}.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="${TIPO}.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="${TIPO}.styles+xml"/></Types>`,
    ),
    '_rels/.rels': xml(`<Relationships xmlns="${NS_PAQUETE}"><Relationship Id="rId1" Type="${NS_REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`),
    'xl/workbook.xml': xml(`<workbook xmlns="${NS}" xmlns:r="${NS_REL}"><sheets><sheet name="${escapar(nombre)}" sheetId="1" r:id="rId1"/></sheets></workbook>`),
    'xl/_rels/workbook.xml.rels': xml(
      `<Relationships xmlns="${NS_PAQUETE}"><Relationship Id="rId1" Type="${NS_REL}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${NS_REL}/styles" Target="styles.xml"/></Relationships>`,
    ),
    'xl/worksheets/sheet1.xml': xml(hoja),
    'xl/styles.xml': xml(ESTILOS),
  })
  return new Blob([zip as Uint8Array<ArrayBuffer>], { type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` })
}

/** Filas de la primera hoja, como texto, con su número de fila en Excel. Lanza un error si no es un .xlsx. */
export function leerXlsx(datos: Uint8Array): { numero: number; celdas: string[] }[] {
  const archivos = unzipSync(datos)
  const leer = (ruta: string) => {
    const contenido = archivos[ruta]
    return contenido ? new DOMParser().parseFromString(strFromU8(contenido), 'application/xml') : undefined
  }
  const todos = (nodo: Document | Element | undefined, etiqueta: string) => (nodo ? [...nodo.getElementsByTagNameNS('*', etiqueta)] : [])
  const texto = (nodo: Element) => todos(nodo, 't').map((t) => t.textContent ?? '').join('')

  const libro = leer('xl/workbook.xml')
  if (!libro) throw new Error('No es un libro de Excel')
  // Primera hoja del libro, siguiendo su relación hasta el archivo que la guarda.
  const idHoja = [...(todos(libro, 'sheet')[0]?.attributes ?? [])].find((a) => a.localName === 'id')?.value
  const destino = todos(leer('xl/_rels/workbook.xml.rels'), 'Relationship').find((r) => r.getAttribute('Id') === idHoja)?.getAttribute('Target') ?? 'worksheets/sheet1.xml'
  const hoja = leer(destino.startsWith('/') ? destino.slice(1) : `xl/${destino}`)
  const compartidos = todos(leer('xl/sharedStrings.xml'), 'si').map(texto)

  return todos(hoja, 'row').map((fila, i) => {
    const celdas: string[] = []
    todos(fila, 'c').forEach((c, j) => {
      const referencia = c.getAttribute('r')
      const valor = todos(c, 'v')[0]?.textContent ?? ''
      const tipo = c.getAttribute('t')
      celdas[referencia ? indiceColumna(referencia) : j] = tipo === 's' ? (compartidos[Number(valor)] ?? '') : tipo === 'inlineStr' ? texto(c) : valor
    })
    return { numero: Number(fila.getAttribute('r')) || i + 1, celdas: Array.from(celdas, (c) => c ?? '') }
  })
}
