import { ONGOING_YEAR } from '../../../../constants'
import { taxLabel, frequencyLabel, formatList } from '../../../../lib'
import type { FiscalYearCalendar, Declaration, Tax, Frequency } from '../../../../types'
import { YEARS_BACK } from './CalendarSection.constants'

/**
 * Aviso cuando el calendario del año ya no tiene la periodicidad con que se presentaron sus declaraciones: ellas
 * conservan su periodo, así que el calendario deja de coincidir con lo declarado. Sin declaraciones así, undefined.
 */
export function otherFrequencyText(
  declarations: Declaration[],
  municipalityId: string,
  tax: Tax,
  fiscalYear: number,
  frequency: Frequency,
) {
  const otherOnes = declarations.filter(
    (d) =>
      d.municipalityId === municipalityId &&
      d.tax === tax &&
      d.fiscalYear === fiscalYear &&
      d.frequency !== frequency,
  )
  if (otherOnes.length === 0) return undefined
  const whichOnes = formatList([
    ...new Set(otherOnes.map((d) => frequencyLabel[d.frequency].toLowerCase())),
  ])
  const howMany = otherOnes.length === 1 ? 'una declaración' : `${otherOnes.length} declaraciones`
  return (
    `Ya hay ${howMany} de ${taxLabel[tax]} de ${fiscalYear} ${otherOnes.length === 1 ? 'presentada' : 'presentadas'} con periodicidad ${whichOnes}. ` +
    `${otherOnes.length === 1 ? 'Conserva su periodo' : 'Conservan su periodo'} aunque la cambies aquí, así que el calendario dejará de coincidir con lo que ya se declaró.`
  )
}

/** Años que aún no están en el calendario: el siguiente y los pasados, del más reciente al más antiguo. */
export const yearsToAdd = (fiscalYears: number[]) =>
  Array.from({ length: YEARS_BACK + 2 }, (_, i) => ONGOING_YEAR + 1 - i).filter(
    (v) => !fiscalYears.includes(v),
  )

/** El año ya configurado más cercano; ante un empate, el más reciente. */
export const nearestCalendar = (calendars: FiscalYearCalendar[], fiscalYear: number) =>
  [...calendars].sort(
    (x, y) =>
      Math.abs(x.fiscalYear - fiscalYear) - Math.abs(y.fiscalYear - fiscalYear) ||
      y.fiscalYear - x.fiscalYear,
  )[0] as FiscalYearCalendar | undefined

/** Mensaje al agregar un año: de dónde salieron sus fechas y qué falta hacer. */
export function addedText(fiscalYear: number, base: FiscalYearCalendar | undefined) {
  if (!base)
    return `Se agregó el año gravable ${fiscalYear}. Pon las fechas del calendario oficial del municipio.`
  const years = Math.abs(fiscalYear - base.fiscalYear)
  return `Se agregó el año gravable ${fiscalYear} con las fechas de ${base.fiscalYear}, corridas ${years === 1 ? 'un año' : `${years} años`}. Cámbialas por las del calendario oficial del municipio y guarda.`
}

/** Errores de un formulario del año, por número de periodo. */
export function formErrors(errors: Record<string, string>, fiscalYear: number, tax: Tax) {
  const prefix = `calendario-${fiscalYear}-${tax}-`
  const ofForm: Record<number, string> = {}
  for (const [key, error] of Object.entries(errors))
    if (key.startsWith(prefix)) ofForm[Number(key.slice(prefix.length))] = error
  return ofForm
}
