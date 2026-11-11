// Calendario tributario: vencimientos por año gravable y formulario, con fecha única o por último dígito del NIT o la cédula.
import { DIGITS, MONTHS_PER_PERIOD, PERIOD_NAMES } from '../constants/calendar'
import type {
  FiscalYearCalendar,
  MunicipalityConfig,
  Declaration,
  Tax,
  Municipality,
  Frequency,
  PeriodDueDate,
  FormDueDates,
} from '../types'
import { shiftYears } from '../utils'

/** Periodos del año sin fechas: una por periodo o, por dígito, diez. */
export const emptyPeriods = (frequency: Frequency, byDigit: boolean): PeriodDueDate[] =>
  PERIOD_NAMES[frequency].map((_, i) => ({
    period: i + 1,
    dates: Array<string>(byDigit ? 10 : 1).fill(''),
  }))

const emptyForm = (frequency: Frequency): FormDueDates => ({
  frequency,
  byDigit: false,
  periods: emptyPeriods(frequency, false),
})

/**
 * Calendario de un año gravable nuevo, pasado o futuro. Si hay un año de base, copia su forma (periodicidad y
 * fechas por dígito) y sus fechas corridas a ese año, para que el administrador solo cambie lo que difiere del
 * calendario oficial. El acto no se copia: es otro. Sin base, arranca vacío, sin fechas inventadas.
 */
export function newCalendar(fiscalYear: number, base?: FiscalYearCalendar): FiscalYearCalendar {
  if (!base)
    return {
      fiscalYear,
      ica: emptyForm('annual'),
      reteica: emptyForm('bimonthly'),
      selfWithholding: emptyForm('bimonthly'),
    }
  const years = fiscalYear - base.fiscalYear
  const run = (f: FormDueDates): FormDueDates => ({
    ...f,
    periods: f.periods.map((p) => ({
      ...p,
      dates: p.dates.map((date) => shiftYears(date, years)),
    })),
  })
  return {
    fiscalYear,
    ica: run(base.ica),
    reteica: run(base.reteica),
    selfWithholding: run(base.selfWithholding),
  }
}

/** Otra periodicidad cambia qué es cada periodo, así que las fechas quedan vacías para ponerlas de nuevo. */
export const withFrequency = (f: FormDueDates, frequency: Frequency): FormDueDates => ({
  ...f,
  frequency,
  periods: emptyPeriods(frequency, f.byDigit),
})

/** Al separar por dígito, cada dígito arranca con la fecha única; al unir, queda la del primer dígito que tenga fecha. */
export const withByDigit = (f: FormDueDates, byDigit: boolean): FormDueDates => ({
  ...f,
  byDigit,
  periods: f.periods.map((p) => ({
    ...p,
    dates: byDigit
      ? Array<string>(10).fill(p.dates[0] ?? '')
      : [DIGITS.map((d) => p.dates[d]).find(Boolean) ?? ''],
  })),
})

/** Cambia una fecha: `posicion` es el dígito, o 0 si la fecha es la misma para todos. */
export const withDate = (
  f: FormDueDates,
  period: number,
  position: number,
  date: string,
): FormDueDates => ({
  ...f,
  periods: f.periods.map((p) =>
    p.period === period
      ? { ...p, dates: p.dates.map((current, i) => (i === position ? date : current)) }
      : p,
  ),
})

/** Primer y último día del periodo dentro del año gravable. */
export function periodRange(frequency: Frequency, fiscalYear: number, period: number) {
  const months = MONTHS_PER_PERIOD[frequency]
  const start = `${fiscalYear}-${String((period - 1) * months + 1).padStart(2, '0')}-01`
  // El día 0 del mes siguiente es el último del mes en que termina el periodo.
  const end = new Date(Date.UTC(fiscalYear, period * months, 0)).toISOString().slice(0, 10)
  return { start, end }
}

/**
 * Vencimiento del periodo para un contribuyente: la fecha única o la de su último dígito. El documento se guarda sin el
 * dígito de verificación, así que su último carácter es el dígito que cuenta. Sin fecha, undefined.
 */
export const dueDateFor = (f: FormDueDates, p: PeriodDueDate, document: string) =>
  (f.byDigit ? p.dates[Number(document.trim().slice(-1))] : p.dates[0]) || undefined

/** Primera y última fecha del periodo; con fecha única, las dos son la misma. Sin fechas, undefined. */
export function dateRange(f: FormDueDates, p: PeriodDueDate) {
  const dates = p.dates
    .slice(0, f.byDigit ? 10 : 1)
    .filter(Boolean)
    .sort()
  return dates.length > 0 ? { from: dates[0], to: dates[dates.length - 1] } : undefined
}

/**
 * Periodos con fechas sin poner en los formularios que el municipio tiene activos. Clave:
 * `calendario-<año>-<impuesto>-<periodo>`.
 */
export function dueDateErrors(cal: FiscalYearCalendar, taxes: Record<Tax, boolean>) {
  const errors: Record<string, string> = {}
  for (const tax of (Object.keys(taxes) as Tax[]).filter((i) => taxes[i])) {
    const f = cal[tax]
    const howMany = f.byDigit ? 10 : 1
    for (const p of f.periods) {
      if (p.dates.slice(0, howMany).filter(Boolean).length < howMany) {
        errors[`calendario-${cal.fiscalYear}-${tax}-${p.period}`] = f.byDigit
          ? 'Pon la fecha de los diez dígitos.'
          : 'Pon la fecha.'
      }
    }
  }
  return errors
}

// --- Calendario cargado (docs/Pendientes-y-decisiones.md, §3.14) ---

/** Cuándo y quién cargó el calendario del año gravable en el municipio; undefined si no lo ha cargado. */
export const calendarUpload = (cfg: MunicipalityConfig | undefined, fiscalYear: number) =>
  cfg?.taxCalendar.byFiscalYear.find((c) => c.fiscalYear === fiscalYear)?.uploaded

/**
 * La declaración se presentó sin el calendario de su año gravable: el municipio no lo había cargado o lo cargó
 * después. Su vencimiento, su sanción y sus intereses pueden estar mal calculados.
 */
export function filedWithoutCalendar(d: Declaration, cfg: MunicipalityConfig | undefined) {
  const upload = calendarUpload(cfg, d.fiscalYear)
  return !upload || d.filingDate < upload.date
}

/**
 * Municipios activos (todos, o solo el elegido) que no han cargado el calendario del año en curso. Se avisa desde el
 * 1 de enero, cuando empiezan a correr los periodos de ReteICA y AutoReteICA del año. Al que no tiene ningún impuesto
 * activo no se le pide: no hay vencimientos que poner.
 */
export const municipalitiesWithoutCalendar = (
  municipalities: Municipality[],
  settingsList: MunicipalityConfig[],
  municipalityId: string | null,
  year: number,
) =>
  municipalities.filter(
    (m) =>
      m.isActive &&
      (municipalityId === null || m.id === municipalityId) &&
      Object.values(m.taxes).some(Boolean) &&
      !calendarUpload(
        settingsList.find((c) => c.municipalityId === m.id),
        year,
      ),
  )

/** Al guardar, los años recién agregados quedan cargados hoy por quien guarda; los que ya estaban conservan su fecha. */
export const withUploads = (
  calendars: FiscalYearCalendar[],
  por: string,
  date: string,
): FiscalYearCalendar[] =>
  calendars.map((c) => (c.uploaded ? c : { ...c, uploaded: { date, por } }))
