// PDF de la declaración con el formato que entrega el municipio. jsPDF se carga solo al descargar.
import { zipSync } from 'fflate'
import type { jsPDF } from 'jspdf'
import type {
  MunicipalityConfig,
  Declaration,
  Tax,
  Registration,
  Municipality,
  Payment,
} from '../types'
import { today } from '../utils'
import { downloadBlob } from './files'
import {
  accountingPositionLabel,
  correctionStatusLabel,
  paymentStatusLabel,
  taxLabel,
  periodLabel,
  documentFormat,
  formatDate,
  formatPesos,
  declarationTypeText,
} from './format'
import {
  currentCorrection,
  isDownwardCorrection,
  paymentStatus,
  TOTAL_LINES,
  correctionSituation,
  totalPaid,
} from './rules'

/** Lo que el PDF necesita además de la declaración; el estado de la demo lo cumple. */
export interface PdfFont {
  municipalities: Municipality[]
  registrations: Registration[]
  declarations: Declaration[]
  payments: Payment[]
  /** Para el estado del pago: el plazo de 2 meses de la retención depende del municipio. */
  settingsList: MunicipalityConfig[]
}

const TITLES: Record<Tax, string> = {
  ica: 'Formulario Único Nacional de Declaración y Pago del Impuesto de Industria y Comercio',
  reteica: 'Declaración de retenciones del impuesto de industria y comercio (ReteICA)',
  selfWithholding:
    'Declaración de autorretenciones del impuesto de industria y comercio (AutoReteICA)',
}

const MARGIN = 40
const WIDTH = 612 - MARGIN * 2 // hoja carta, en puntos
const RIGHT = MARGIN + WIDTH
const LIMIT = 792 - 60
const INK: [number, number, number] = [15, 23, 42]
const GRAY: [number, number, number] = [100, 116, 139]
const BLUE: [number, number, number] = [29, 78, 216]

// Las fuentes estándar del PDF no traen guiones largos ni espacios angostos.
const clean = (t: string) => t.replace(/[–—]/g, '-').replace(/\s/g, ' ')

function draw(doc: jsPDF, d: Declaration, source: PdfFont) {
  const municipality = source.municipalities.find((m) => m.id === d.municipalityId)
  const reg = source.registrations.find((i) => i.id === d.registrationId)
  const corrected = d.correctsId
    ? source.declarations.find((x) => x.id === d.correctsId)
    : undefined
  const corrects = corrected?.number
  const application = correctionSituation(d, today())
  let y = MARGIN

  const style = (bold: boolean, size: number, color = INK) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...color)
  }
  const jumpIfMissing = (height: number) => {
    if (y + height <= LIMIT) return
    doc.addPage()
    y = MARGIN
  }
  const section = (name: string) => {
    jumpIfMissing(60)
    style(true, 9, BLUE)
    doc.text(name.toUpperCase(), MARGIN, y)
    doc.setDrawColor(203, 213, 225)
    doc.line(MARGIN, y + 5, RIGHT, y + 5)
    y += 22
  }
  /** Pares etiqueta / valor en dos columnas. */
  const fields = (pairs: [string, string][]) => {
    for (let i = 0; i < pairs.length; i += 2) {
      jumpIfMissing(30)
      pairs.slice(i, i + 2).forEach(([label, value], j) => {
        const x = MARGIN + j * (WIDTH / 2)
        style(false, 8, GRAY)
        doc.text(label, x, y)
        style(false, 10)
        doc.text(
          (doc.splitTextToSize(clean(value), WIDTH / 2 - 16) as string[])[0] ?? '',
          x,
          y + 13,
        )
      })
      y += 30
    }
    y += 8
  }

  // Encabezado
  const title = doc.splitTextToSize(TITLES[d.tax], WIDTH - 200) as string[]
  const height = 52 + title.length * 12
  doc.setFillColor(239, 246, 255)
  doc.rect(MARGIN, y, WIDTH, height, 'F')
  style(true, 12)
  doc.text(`MUNICIPIO DE ${municipality?.name.toUpperCase() ?? ''}`, MARGIN + 14, y + 22)
  style(false, 9, GRAY)
  doc.text(
    `${municipality?.department ?? ''} · Código DANE ${municipality?.daneCode ?? ''}`,
    MARGIN + 14,
    y + 36,
  )
  style(true, 10)
  doc.text(title, MARGIN + 14, y + 54)
  style(false, 8, GRAY)
  doc.text('Radicado', RIGHT - 14, y + 20, { align: 'right' })
  style(true, 12)
  doc.text(d.number, RIGHT - 14, y + 36, { align: 'right' })
  style(false, 9)
  doc.text(
    `Tipo: ${declarationTypeText(d.kind, isDownwardCorrection(d, corrected))}`,
    RIGHT - 14,
    y + 50,
    { align: 'right' },
  )
  y += height + 26

  section('A. Datos de la declaración')
  const data: [string, string][] = [
    ['Impuesto', taxLabel[d.tax]],
    ['Periodo', periodLabel(d)],
    ['Número de factura', String(d.invoiceNumber)],
    ['Fecha de presentación', formatDate(d.filingDate)],
    ['Fecha de vencimiento', formatDate(d.dueDate)],
  ]
  if (corrects) data.push(['Corrige la declaración', corrects])
  // Mientras el municipio no la acepte, la solicitud de corrección a la baja no sirve para pagar.
  if (application) {
    const status = correctionStatusLabel[application.status]
    data.push([
      'Solicitud de corrección',
      currentCorrection(application) ? status : `${status}: no sirve para pagar`,
    ])
  }
  if (d.closingDate) data.push(['Fecha de cierre', formatDate(d.closingDate)])
  fields(data)

  // Lo que se escribió en la declaración, aunque después hayan cambiado los datos en el RIT.
  const { taxpayer: filedTaxpayer } = d
  section('B. Contribuyente')
  const taxpayer: [string, string][] = [
    ['Nombre o razón social', filedTaxpayer.name],
    ['Documento', documentFormat(filedTaxpayer)],
    ['Dirección', filedTaxpayer.address],
    ['Teléfono', filedTaxpayer.phone],
    ['Correo electrónico', filedTaxpayer.email],
  ]
  if (filedTaxpayer.establishments !== undefined)
    taxpayer.push(['Establecimientos en el municipio', String(filedTaxpayer.establishments)])
  if (reg && municipality?.rit) taxpayer.push(['Número de RIT', reg.ritNumber])
  fields(taxpayer)

  section('C. Liquidación')
  const conceptCol = MARGIN + 64
  const conceptWidth = WIDTH - 64 - 140
  const tableHeader = () => {
    doc.setFillColor(241, 245, 249)
    doc.rect(MARGIN, y - 12, WIDTH, 20, 'F')
    style(true, 8, GRAY)
    doc.text('RENGLÓN', MARGIN + 8, y + 1)
    doc.text('CONCEPTO', conceptCol, y + 1)
    doc.text('VALOR', RIGHT - 8, y + 1, { align: 'right' })
    y += 22
  }
  tableHeader()
  for (const r of d.lines) {
    const total = TOTAL_LINES.has(r.code)
    const textLines = doc.splitTextToSize(clean(r.concept), conceptWidth) as string[]
    const rowHeight = textLines.length * 11 + 9
    if (y + rowHeight > LIMIT) {
      doc.addPage()
      y = MARGIN + 12
      tableHeader()
    }
    if (total) {
      doc.setFillColor(248, 250, 252)
      doc.rect(MARGIN, y - 11, WIDTH, rowHeight, 'F')
    }
    style(total, 9, total ? INK : GRAY)
    doc.text(clean(r.code), MARGIN + 8, y)
    style(total, 9)
    doc.text(textLines, conceptCol, y)
    doc.text(clean(formatPesos(r.value)), RIGHT - 8, y, { align: 'right' })
    doc.setDrawColor(226, 232, 240)
    doc.line(MARGIN, y - 11 + rowHeight, RIGHT, y - 11 + rowHeight)
    y += rowHeight
  }
  y += 20

  section('D. Pago')
  const paidAmount = totalPaid(d.id, source.payments)
  const payment: [string, string][] = [
    ['Total a pagar', formatPesos(d.totalToPay)],
    ['Total pagado', formatPesos(paidAmount)],
    ['Saldo pendiente', formatPesos(Math.max(d.totalToPay - paidAmount, 0))],
    // La solicitud de corrección que no se ha aceptado no se paga.
    [
      'Estado del pago',
      currentCorrection(application)
        ? paymentStatusLabel[
            paymentStatus(
              d,
              source.payments,
              source.settingsList.find((c) => c.municipalityId === d.municipalityId),
              today(),
            )
          ]
        : 'No aplica',
    ],
  ]
  if (d.creditBalance > 0) payment.push(['Saldo a favor', formatPesos(d.creditBalance)])
  fields(payment)

  section('E. Firmas')
  const c = d.accountant
  const signatures: [string, string][] = [
    ['Declarante', d.filer.name],
    ['Documento del declarante', documentFormat(d.filer)],
    c ? [accountingPositionLabel[c.jobTitle], c.name] : ['Contador o revisor fiscal', 'No firma'],
  ]
  if (c)
    signatures.push(
      [`Documento del ${accountingPositionLabel[c.jobTitle].toLowerCase()}`, documentFormat(c)],
      ['Tarjeta profesional', c.professionalCard],
    )
  fields(signatures)

  // Pie en todas las páginas
  const pages = doc.getNumberOfPages()
  const generated = formatDate(new Date().toISOString().slice(0, 10))
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    style(false, 8, GRAY)
    doc.text(
      clean(
        `Copia de la declaración ${d.number} · Generada por el Gestor de Pagos el ${generated}`,
      ),
      MARGIN,
      792 - 30,
    )
    doc.text(`Página ${p} de ${pages}`, RIGHT, 792 - 30, { align: 'right' })
  }
}

async function declarationPdf(d: Declaration, source: PdfFont) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  draw(doc, d, source)
  return new Uint8Array(doc.output('arraybuffer'))
}

export async function downloadDeclaration(d: Declaration, source: PdfFont) {
  const pdf = await declarationPdf(d, source)
  downloadBlob(
    new Blob([pdf as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }),
    `${d.number}.pdf`,
  )
}

/** Un .zip con el PDF de cada declaración. */
export async function downloadDeclarationsZip(
  list: Declaration[],
  source: PdfFont,
  zipName: string,
) {
  const optionEntries = await Promise.all(
    list.map(async (d) => [`${d.number}.pdf`, await declarationPdf(d, source)] as const),
  )
  const zip = zipSync(Object.fromEntries(optionEntries))
  downloadBlob(new Blob([zip as Uint8Array<ArrayBuffer>], { type: 'application/zip' }), zipName)
}
