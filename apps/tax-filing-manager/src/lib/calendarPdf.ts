// PDF del calendario de vencimientos de un municipio
import type { jsPDF } from 'jspdf'
import type { EarlyPaymentTier, FiscalYearCalendar, Municipality, Tax } from '../types'
import { DIGITS, PERIOD_NAMES } from '../constants/calendar'
import { frequencyLabel, formatDate, taxLabel } from './format'
import { today } from '../utils'

const MARGIN = 40
const WIDTH = 612 - MARGIN * 2
const RIGHT = MARGIN + WIDTH
const LIMIT = 792 - 60
const INK: [number, number, number] = [15, 23, 42]
const GRAY: [number, number, number] = [100, 116, 139]
const BLUE: [number, number, number] = [29, 78, 216]

const clean = (t: string) => t.replace(/[–—]/g, '-').replace(/\s/g, ' ')

/** La fecha puesta, o un guion si a ese periodo o dígito le falta. */
const dateText = (iso: string | undefined) => (iso ? formatDate(iso) : '-')

function draw(
  doc: jsPDF,
  cal: FiscalYearCalendar,
  municipality: Municipality | undefined,
  forms: Tax[],
  tiers: EarlyPaymentTier[] = [],
) {
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
    doc.text(name, MARGIN, y)
    doc.setDrawColor(203, 213, 225)
    doc.line(MARGIN, y + 5, RIGHT, y + 5)
    y += 22
  }

  /** Tarjeta horizontal para cada tramo de descuento por pronto pago */
  const tierCard = (tier: EarlyPaymentTier) => {
    const cardH = 40
    const leftW = 152

    jumpIfMissing(cardH + 6)

    // Contenedor blanco con borde redondeado
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(203, 213, 225)
    doc.roundedRect(MARGIN, y, WIDTH, cardH, 6, 6, 'FD')

    // Bloque izquierdo azul suave con el porcentaje destacado
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(MARGIN + 0.5, y + 0.5, leftW, cardH - 1, 5, 5, 'F')
    doc.rect(MARGIN + leftW - 6, y + 0.5, 6, cardH - 1, 'F')
    doc.setDrawColor(203, 213, 225)
    doc.line(MARGIN + leftW, y, MARGIN + leftW, y + cardH)

    style(true, 11, BLUE)
    doc.text(`${tier.percentage}%`, MARGIN + 12, y + 19)
    style(false, 7.5, GRAY)
    doc.text('de descuento', MARGIN + 12, y + 31)

    // Columna "Pago desde"
    const fromX = MARGIN + leftW + 16
    style(true, 7, GRAY)
    doc.text('PAGO DESDE', fromX, y + 15)
    style(true, 9, INK)
    doc.text(clean(dateText(tier.from)), fromX, y + 29)

    // Columna "Pago hasta"
    const toX = MARGIN + leftW + 190
    style(true, 7, GRAY)
    doc.text('PAGO HASTA', toX, y + 15)
    style(true, 9, INK)
    doc.text(clean(dateText(tier.to)), toX, y + 29)

    y += cardH + 6
  }

  /** Tarjeta horizontal para trámites con fecha única */
  const singleCard = (periodName: string, iso: string | undefined) => {
    const cardH = 34
    const leftW = 152

    jumpIfMissing(cardH + 6)

    // Contenedor blanco con borde redondeado
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(203, 213, 225)
    doc.roundedRect(MARGIN, y, WIDTH, cardH, 6, 6, 'FD')

    // Bloque izquierdo azul suave
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(MARGIN + 0.5, y + 0.5, leftW, cardH - 1, 5, 5, 'F')
    doc.rect(MARGIN + leftW - 6, y + 0.5, 6, cardH - 1, 'F')
    doc.setDrawColor(203, 213, 225)
    doc.line(MARGIN + leftW, y, MARGIN + leftW, y + cardH)

    // Nombre del periodo a la izquierda
    style(true, 8.5, BLUE)
    doc.text(clean(periodName), MARGIN + 12, y + 20)

    // Fecha única a la derecha
    if (iso) {
      style(true, 9.5, INK)
      doc.text(clean(dateText(iso)), MARGIN + leftW + 16, y + 20)
    } else {
      style(false, 9, GRAY)
      doc.text('Sin fecha configurada', MARGIN + leftW + 16, y + 20)
    }
    y += cardH + 6
  }

  /** Tarjeta horizontal para trámites por cédula */
  const digitCard = (periodName: string, dates: Record<number, string | undefined>) => {
    const cardH = 54
    const leftW = 152
    const labelW = 40
    const colW = (WIDTH - leftW - labelW) / 10

    jumpIfMissing(cardH + 8)

    // Convertir cada fecha en números { year, month, day }
    const parsed = DIGITS.map((d) => {
      const iso = dates[d]
      if (!iso) return null
      const [year, month, day] = iso.split('-').map(Number)
      return year && month && day ? { year, month, day } : null
    })
    const hasDates = parsed.some((x) => x !== null)

    // Dibujar el borde y fondo blanco de toda la tarjeta
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(203, 213, 225)
    doc.roundedRect(MARGIN, y, WIDTH, cardH, 6, 6, 'FD')

    // Dibujar el bloque izquierdo con fondo azul suave
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(MARGIN + 0.5, y + 0.5, leftW, cardH - 1, 5, 5, 'F')
    doc.rect(MARGIN + leftW - 6, y + 0.5, 6, cardH - 1, 'F')
    doc.setDrawColor(203, 213, 225)
    doc.line(MARGIN + leftW, y, MARGIN + leftW, y + cardH)

    // Textos fijos del bloque izquierdo
    style(true, 7.5, BLUE)
    doc.text(clean(periodName), MARGIN + 10, y + 16)
    style(true, 10, INK)
    doc.text(hasDates ? 'Fechas límite' : 'Sin fechas', MARGIN + 10, y + 34)

    // Etiquetas de la columna guía ("Dígito" y "Fecha")
    const labelX = MARGIN + leftW + 8
    style(false, 6.5, GRAY)
    doc.text('Dígito', labelX, y + 17)
    doc.text('Fecha', labelX, y + 34)

    // Dibujar las 10 columnas de dígitos con su día y mes
    const startX = MARGIN + leftW + labelW
    DIGITS.forEach((digit, i) => {
      const cx = startX + i * colW + colW / 2
      const item = parsed[i]

      // Dígito arriba (cedula)
      style(true, 8, GRAY)
      doc.text(String(digit), cx, y + 17, { align: 'center' })

      // Fecha abajo
      if (!item) {
        style(false, 9, GRAY)
        doc.text('-', cx, y + 34, { align: 'center' })
      } else {
        const dd = String(item.day).padStart(2, '0')
        const mm = String(item.month).padStart(2, '0')
        style(true, 8.5, BLUE)
        doc.text(`${dd}/${mm}`, cx, y + 32, { align: 'center' })
        style(false, 7, GRAY)
        doc.text(String(item.year), cx, y + 43, { align: 'center' })
      }
    })
    y += cardH + 8
  }

  // Encabezado: municipio, año gravable y el acto que fija el calendario, si lo hay.
  const decree = cal.decree
    ? (
        doc.splitTextToSize(
          `Acto que fija el calendario: ${clean(cal.decree)}`,
          WIDTH - 28,
        ) as string[]
      )[0]
    : ''
  const height = 60 + (decree ? 16 : 0)
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
  doc.text('Calendario de vencimientos', MARGIN + 14, y + 54)
  style(true, 12)
  doc.text(`Año gravable ${cal.fiscalYear}`, RIGHT - 14, y + 36, { align: 'right' })
  if (decree) {
    style(false, 9, GRAY)
    doc.text(decree, MARGIN + 14, y + 70)
  }
  y += height + 26

  const drawTiers = () => {
    const note = doc.splitTextToSize(
      `El año gravable ${cal.fiscalYear} se declara y paga en ${cal.fiscalYear + 1}. El descuento depende de la fecha de pago, por fuera de estos tramos no hay descuento.`,
      WIDTH,
    ) as string[]
    section('Descuento por pronto pago')
    jumpIfMissing(note.length * 11 + 50)
    style(false, 8, GRAY)
    note.forEach((line, i) => doc.text(line, MARGIN, y + i * 11))
    y += note.length * 11 + 6
    for (const tier of tiers) {
      tierCard(tier)
    }
    y += 10
  }

  let drewTiers = false

  // Un trámite por sección
  for (const tax of forms) {
    const f = cal[tax]
    const names = PERIOD_NAMES[f.frequency]
    section(taxLabel[tax])
    jumpIfMissing(40)
    style(false, 9, GRAY)
    doc.text(`Periodicidad: ${frequencyLabel[f.frequency]}`, MARGIN, y)
    y += 15

    if (f.byDigit) {
      jumpIfMissing(40)
      style(false, 8, GRAY)
      doc.text(
        'El dígito es el último del NIT o de la cédula, sin el dígito de verificación (DV).',
        MARGIN,
        y,
      )
      y += 16
      for (const p of f.periods) {
        digitCard(names[p.period - 1], p.dates)
      }
      y += 10
    } else {
      jumpIfMissing(80)
      style(false, 8, GRAY)

      for (const p of f.periods) {
        singleCard(names[p.period - 1], p.dates[0])
      }
      y += 10
    }

    // Justo después de ICA dibuja los descuentos por pronto pago
    if (tax === 'ica' && tiers.length > 0) {
      drawTiers()
      drewTiers = true
    }
  }

  // Respaldo: si hay tramos guardados pero ICA anual no estaba en `forms`, los dibuja al final
  if (!drewTiers && tiers.length > 0) {
    drawTiers()
  }

  // Pie en todas las páginas
  const pages = doc.getNumberOfPages()
  const generated = formatDate(today())
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    style(false, 8, GRAY)
    doc.text(
      clean(
        `Calendario de vencimientos de ${municipality?.name ?? ''} · Año gravable ${cal.fiscalYear} · Generado por el Gestor Autoliquidables el ${generated}`,
      ),
      MARGIN,
      792 - 30,
    )
    doc.text(`Página ${p} de ${pages}`, RIGHT, 792 - 30, { align: 'right' })
  }
}

async function calendarPdf(
  cal: FiscalYearCalendar,
  municipality: Municipality | undefined,
  forms: Tax[],
  tiers: EarlyPaymentTier[],
) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  draw(doc, cal, municipality, forms, tiers)
  return new Uint8Array(doc.output('arraybuffer'))
}

/** El PDF del calendario en memoria, para mostrarlo sin descargarlo. */
export async function calendarBlob(
  cal: FiscalYearCalendar,
  municipality: Municipality | undefined,
  forms: Tax[],
  tiers: EarlyPaymentTier[],
) {
  const pdf = await calendarPdf(cal, municipality, forms, tiers)
  return new Blob([pdf as Uint8Array<ArrayBuffer>], { type: 'application/pdf' })
}
