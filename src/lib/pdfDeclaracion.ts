// PDF de la declaración con el formato que entrega el municipio. jsPDF se carga solo al descargar.
import { zipSync } from 'fflate'
import type { jsPDF } from 'jspdf'
import type { Declaracion, Impuesto, Inscripcion, Municipio, Pago } from '../types'
import { descargarBlob } from './archivos'
import { etiquetaEstadoPago, etiquetaImpuesto, etiquetaPeriodo, etiquetaTipoDeclaracion, formatoFecha, formatoPesos } from './formato'
import { estadoPago, RENGLONES_TOTALES, totalPagado } from './reglas'

/** Lo que el PDF necesita además de la declaración; el estado de la demo lo cumple. */
export interface FuentePdf {
  municipios: Municipio[]
  inscripciones: Inscripcion[]
  declaraciones: Declaracion[]
  pagos: Pago[]
}

const TITULOS: Record<Impuesto, string> = {
  ica: 'Formulario Único Nacional de Declaración y Pago del Impuesto de Industria y Comercio',
  reteica: 'Declaración de retenciones del impuesto de industria y comercio (ReteICA)',
  autorretencion: 'Declaración de autorretenciones del impuesto de industria y comercio (AutoReteICA)',
}

const MARGEN = 40
const ANCHO = 612 - MARGEN * 2 // hoja carta, en puntos
const DERECHA = MARGEN + ANCHO
const LIMITE = 792 - 60
const TINTA: [number, number, number] = [15, 23, 42]
const GRIS: [number, number, number] = [100, 116, 139]
const AZUL: [number, number, number] = [29, 78, 216]

// Las fuentes estándar del PDF no traen guiones largos ni espacios angostos.
const limpio = (t: string) => t.replace(/[–—]/g, '-').replace(/\s/g, ' ')

function dibujar(doc: jsPDF, d: Declaracion, fuente: FuentePdf) {
  const municipio = fuente.municipios.find((m) => m.id === d.municipioId)
  const ins = fuente.inscripciones.find((i) => i.id === d.inscripcionId)
  const corrige = d.corrigeA ? fuente.declaraciones.find((x) => x.id === d.corrigeA)?.numero : undefined
  let y = MARGEN

  const estilo = (negrita: boolean, tamano: number, color = TINTA) => {
    doc.setFont('helvetica', negrita ? 'bold' : 'normal')
    doc.setFontSize(tamano)
    doc.setTextColor(...color)
  }
  const saltoSiFalta = (alto: number) => {
    if (y + alto <= LIMITE) return
    doc.addPage()
    y = MARGEN
  }
  const seccion = (nombre: string) => {
    saltoSiFalta(60)
    estilo(true, 9, AZUL)
    doc.text(nombre.toUpperCase(), MARGEN, y)
    doc.setDrawColor(203, 213, 225)
    doc.line(MARGEN, y + 5, DERECHA, y + 5)
    y += 22
  }
  /** Pares etiqueta / valor en dos columnas. */
  const campos = (pares: [string, string][]) => {
    for (let i = 0; i < pares.length; i += 2) {
      saltoSiFalta(30)
      pares.slice(i, i + 2).forEach(([etiqueta, valor], j) => {
        const x = MARGEN + j * (ANCHO / 2)
        estilo(false, 8, GRIS)
        doc.text(etiqueta, x, y)
        estilo(false, 10)
        doc.text((doc.splitTextToSize(limpio(valor), ANCHO / 2 - 16) as string[])[0] ?? '', x, y + 13)
      })
      y += 30
    }
    y += 8
  }

  // Encabezado
  const titulo = doc.splitTextToSize(TITULOS[d.impuesto], ANCHO - 200) as string[]
  const alto = 52 + titulo.length * 12
  doc.setFillColor(239, 246, 255)
  doc.rect(MARGEN, y, ANCHO, alto, 'F')
  estilo(true, 12)
  doc.text(`MUNICIPIO DE ${municipio?.nombre.toUpperCase() ?? ''}`, MARGEN + 14, y + 22)
  estilo(false, 9, GRIS)
  doc.text(`${municipio?.departamento ?? ''} · Código DANE ${municipio?.codigoDane ?? ''}`, MARGEN + 14, y + 36)
  estilo(true, 10)
  doc.text(titulo, MARGEN + 14, y + 54)
  estilo(false, 8, GRIS)
  doc.text('Radicado', DERECHA - 14, y + 20, { align: 'right' })
  estilo(true, 12)
  doc.text(d.numero, DERECHA - 14, y + 36, { align: 'right' })
  estilo(false, 9)
  doc.text(`Tipo: ${etiquetaTipoDeclaracion[d.tipo]}`, DERECHA - 14, y + 50, { align: 'right' })
  y += alto + 26

  seccion('A. Datos de la declaración')
  const datos: [string, string][] = [
    ['Impuesto', etiquetaImpuesto[d.impuesto]],
    ['Periodo', etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo)],
    ['Número de factura', String(d.numeroFactura)],
    ['Fecha de presentación', formatoFecha(d.fechaPresentacion)],
    ['Fecha de vencimiento', formatoFecha(d.fechaVencimiento)],
  ]
  if (corrige) datos.push(['Corrige la declaración', corrige])
  if (d.fechaCierre) datos.push(['Fecha de cierre', formatoFecha(d.fechaCierre)])
  campos(datos)

  seccion('B. Declarante')
  const declarante: [string, string][] = [
    ['Nombre o razón social', ins?.nombre ?? '—'],
    ['Documento', ins ? `${ins.tipoDocumento} ${ins.documento}${ins.dv ? `-${ins.dv}` : ''}` : '—'],
    ['Dirección', ins?.direccion ?? '—'],
    ['Correo electrónico', ins?.correo ?? '—'],
  ]
  if (ins && municipio?.rit) declarante.push(['Número de RIT', ins.numeroRit])
  campos(declarante)

  seccion('C. Liquidación')
  const colConcepto = MARGEN + 64
  const anchoConcepto = ANCHO - 64 - 140
  const encabezadoTabla = () => {
    doc.setFillColor(241, 245, 249)
    doc.rect(MARGEN, y - 12, ANCHO, 20, 'F')
    estilo(true, 8, GRIS)
    doc.text('RENGLÓN', MARGEN + 8, y + 1)
    doc.text('CONCEPTO', colConcepto, y + 1)
    doc.text('VALOR', DERECHA - 8, y + 1, { align: 'right' })
    y += 22
  }
  encabezadoTabla()
  for (const r of d.renglones) {
    const total = RENGLONES_TOTALES.has(r.codigo)
    const lineas = doc.splitTextToSize(limpio(r.concepto), anchoConcepto) as string[]
    const altoFila = lineas.length * 11 + 9
    if (y + altoFila > LIMITE) {
      doc.addPage()
      y = MARGEN + 12
      encabezadoTabla()
    }
    if (total) {
      doc.setFillColor(248, 250, 252)
      doc.rect(MARGEN, y - 11, ANCHO, altoFila, 'F')
    }
    estilo(total, 9, total ? TINTA : GRIS)
    doc.text(limpio(r.codigo), MARGEN + 8, y)
    estilo(total, 9)
    doc.text(lineas, colConcepto, y)
    doc.text(limpio(formatoPesos(r.valor)), DERECHA - 8, y, { align: 'right' })
    doc.setDrawColor(226, 232, 240)
    doc.line(MARGEN, y - 11 + altoFila, DERECHA, y - 11 + altoFila)
    y += altoFila
  }
  y += 20

  seccion('D. Pago')
  const pagado = totalPagado(d.id, fuente.pagos)
  const pago: [string, string][] = [
    ['Total a pagar', formatoPesos(d.totalAPagar)],
    ['Total pagado', formatoPesos(pagado)],
    ['Saldo pendiente', formatoPesos(Math.max(d.totalAPagar - pagado, 0))],
    ['Estado del pago', etiquetaEstadoPago[estadoPago(d, fuente.pagos)]],
  ]
  if (d.saldoAFavor > 0) pago.push(['Saldo a favor', formatoPesos(d.saldoAFavor)])
  campos(pago)

  // Pie en todas las páginas
  const paginas = doc.getNumberOfPages()
  const generado = formatoFecha(new Date().toISOString().slice(0, 10))
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p)
    estilo(false, 8, GRIS)
    doc.text(limpio(`Copia de la declaración ${d.numero} · Generada por el Gestor de Pagos el ${generado}`), MARGEN, 792 - 30)
    doc.text(`Página ${p} de ${paginas}`, DERECHA, 792 - 30, { align: 'right' })
  }
}

async function pdfDeDeclaracion(d: Declaracion, fuente: FuentePdf) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  dibujar(doc, d, fuente)
  return new Uint8Array(doc.output('arraybuffer'))
}

export async function descargarDeclaracion(d: Declaracion, fuente: FuentePdf) {
  const pdf = await pdfDeDeclaracion(d, fuente)
  descargarBlob(new Blob([pdf as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }), `${d.numero}.pdf`)
}

/** Un .zip con el PDF de cada declaración. */
export async function descargarDeclaracionesZip(lista: Declaracion[], fuente: FuentePdf, nombreZip: string) {
  const entradas = await Promise.all(lista.map(async (d) => [`${d.numero}.pdf`, await pdfDeDeclaracion(d, fuente)] as const))
  const zip = zipSync(Object.fromEntries(entradas))
  descargarBlob(new Blob([zip as Uint8Array<ArrayBuffer>], { type: 'application/zip' }), nombreZip)
}
