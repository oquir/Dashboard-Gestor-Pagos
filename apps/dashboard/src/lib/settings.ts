// Edición de la configuración y del calendario del municipio: borrador, validaciones, vencimientos y tramos de pronto pago.
import type { MunicipalityConfig, Tax, EarlyPaymentTier } from '../types'
import { dueDateErrors } from './calendar'
import { formatDate } from './format'
import { MAX_ADVANCE, STATUTORY_PENALTIES } from './rules'

/** Valor de un campo numérico; vacío cuenta como 0. */
export const number = (v: string) => (v === '' ? 0 : Number(v))

const nextDay = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}
const endOfMonth = (iso: string) =>
  new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), 0)).toISOString().slice(0, 10)

/** Un tramo nuevo arranca el día siguiente al último y llega hasta fin de ese mes. */
export function newTier(fiscalYear: number, tiers: EarlyPaymentTier[]): EarlyPaymentTier {
  const last = tiers
    .map((t) => t.to)
    .filter(Boolean)
    .sort()
    .at(-1)
  const from = last ? nextDay(last) : `${fiscalYear + 1}-01-01`
  return { from, to: endOfMonth(from), percentage: tiers.at(-1)?.percentage ?? 10 }
}

function tierErrors(fiscalYear: number, tiers: EarlyPaymentTier[]) {
  return tiers.map((t, i) => {
    if (!t.from || !t.to) return 'Completa las dos fechas.'
    if (t.from > t.to) return 'La fecha final es anterior a la inicial.'
    if (t.from <= `${fiscalYear}-12-31`)
      return `El año gravable ${fiscalYear} se declara y paga desde ${fiscalYear + 1}.`
    if (t.percentage <= 0 || t.percentage > 100)
      return 'El descuento debe ser mayor que 0 y máximo 100 %.'
    const crossCheck = tiers.find(
      (o, j) => j !== i && o.from && o.to && o.from <= t.to && t.from <= o.to,
    )
    return (
      crossCheck &&
      `Se cruza con el tramo del ${formatDate(crossCheck.from)} al ${formatDate(crossCheck.to)}.`
    )
  })
}

/** Errores del borrador de Configuración por campo; sin errores, se puede guardar. El calendario se valida aparte. */
export function settingsErrors(b: MunicipalityConfig) {
  const errors: Record<string, string> = {}
  for (const key of Object.keys(STATUTORY_PENALTIES) as (keyof MunicipalityConfig['penalties'])[]) {
    if (b.penalties[key] > STATUTORY_PENALTIES[key])
      errors[key] =
        `La ley fija como máximo ${STATUTORY_PENALTIES[key]}; el municipio solo puede bajarla.`
    if (b.penalties[key] < 0) errors[key] = 'No puede ser negativa.'
  }
  if (b.advancePercentage > MAX_ADVANCE)
    errors.anticipo = `Máximo ${MAX_ADVANCE}% (art. 47 de la Ley 43 de 1987).`
  if (b.fireSurcharge.active && b.fireSurcharge.percentage <= 0)
    errors.sobretasa = 'Debe ser mayor que 0; si no se cobra, desactívala.'
  if (b.priorApproval.termBusinessDays < 1)
    errors.plazoAprobacion = 'Debe ser de al menos 1 día hábil.'
  if (b.priorApproval.receiptValidityBusinessDays < 1)
    errors.vigenciaRecibo = 'Debe ser de al menos 1 día hábil.'
  for (const [form, disabled] of Object.entries(b.disabledForms)) {
    if (!disabled.reason.trim())
      errors[`motivo-${form}`] = 'Indica por qué se desactiva el formulario.'
  }
  return errors
}

/**
 * Errores del borrador de la página Calendario: tramos de pronto pago y vencimientos sin fecha. Los vencimientos
 * solo se exigen en los formularios que el municipio tiene activos.
 */
export function calendarErrors(b: MunicipalityConfig, taxes: Record<Tax, boolean>) {
  const errors: Record<string, string> = {}
  if (b.earlyPayment.isActive && taxes.ica) {
    for (const { fiscalYear, tiers } of b.earlyPayment.byFiscalYear) {
      tierErrors(fiscalYear, tiers).forEach((error, i) => {
        if (error) errors[`pronto-${fiscalYear}-${i}`] = error
      })
    }
  }
  for (const cal of b.taxCalendar.byFiscalYear) Object.assign(errors, dueDateErrors(cal, taxes))
  return errors
}
