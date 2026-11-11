// Reglas del dominio que usa el dashboard (ver docs/Dominio-ICA.md, secciones 5 y 6).
import type {
  FiscalYearActivities,
  StoredFile,
  NotFiledGround,
  Check,
  MunicipalityConfig,
  Declaration,
  ApprovalStatus,
  CorrectionStatus,
  PaymentStatus,
  Tax,
  Registration,
  Payment,
  Sector,
  Rate,
} from '../types'
import { dayDifference, addMonths } from '../utils'

/** UVT 2026 (dato que caduca, sección 7 del dominio). */
export const UVT = 52374

/** Topes de ley: el municipio solo puede bajarlos (art. 59, Ley 788 de 2002). */
export const STATUTORY_PENALTIES: MunicipalityConfig['penalties'] = {
  lateFiling: 5,
  summonsLateFiling: 10,
  correction: 10,
  summonsCorrection: 20,
  minimumUvt: 10,
}

/** Tope de la extemporaneidad, en % del impuesto: antes del emplazamiento para declarar (art. 641) y después (art. 642). */
export const LATE_FILING_CAP = 100
export const SUMMONS_LATE_FILING_CAP = 200

/**
 * Sanción por extemporaneidad: la tasa del municipio por cada mes o fracción de retardo desde el vencimiento, sobre el
 * impuesto a cargo, con su tope y sin bajar de la mínima. Quien declara después de notificado el emplazamiento para
 * declarar usa la tasa y el tope del art. 642; si no, los del art. 641. Sin impuesto a cargo queda la mínima: la sanción
 * sobre los ingresos brutos no se modela.
 */
export function lateFilingPenalty(
  base: number,
  daysLate: number,
  penalties: MunicipalityConfig['penalties'],
  summonedItem = false,
) {
  if (daysLate <= 0) return 0
  const months = Math.ceil(daysLate / 30)
  const taxRate = summonedItem ? penalties.summonsLateFiling : penalties.lateFiling
  const cap = summonedItem ? SUMMONS_LATE_FILING_CAP : LATE_FILING_CAP
  return Math.max(
    roundToThousand((base * Math.min(months * taxRate, cap)) / 100),
    roundToThousand(penalties.minimumUvt * UVT),
  )
}

export const MAX_ADVANCE = 40

/** Rango de tarifas por mil; el sector financiero tiene reglas propias. */
export const RATE_CAPS: Record<Exclude<Sector, 'financial'>, [number, number]> = {
  industrial: [2, 7],
  commercial: [2, 10],
  services: [2, 10],
}

export function overCap({ sector, perThousand }: Rate) {
  if (sector === 'financial') return false
  const [min, max] = RATE_CAPS[sector]
  return perThousand < min || perThousand > max
}

/** Actividades que rigen en el año gravable: las de ese año o, si no se han cargado, las del último año anterior. */
export const activitiesOf = (
  uploads: FiscalYearActivities[],
  municipalityId: string,
  fiscalYear: number,
) =>
  uploads
    .filter((c) => c.municipalityId === municipalityId && c.fiscalYear <= fiscalYear)
    .sort((a, b) => b.fiscalYear - a.fiscalYear)[0]

export function totalPaid(declarationId: string, payments: Payment[]) {
  return payments
    .filter((p) => p.declarationId === declarationId)
    .reduce((sum, p) => sum + p.value, 0)
}

/** Lo que está en cheques de gerencia en canje: aún no es pago, pero tampoco se puede volver a cobrar. */
export function totalInClearing(declarationId: string, checks: Check[]) {
  return checks
    .filter((c) => c.declarationId === declarationId && c.status === 'in_clearing')
    .reduce((sum, c) => sum + c.value, 0)
}

/** Sanción por cheque devuelto sin causa justificada (art. 731 del Código de Comercio); en la demo solo se avisa. */
export const RETURNED_CHECK_PENALTY = 0.2

/** Meses que tiene el agente para consignar lo retenido después del vencimiento (art. 402 del Código Penal y art. 580-1 del ET). */
export const MONTHS_TO_REMIT = 2

/**
 * Último día de un plazo en meses: el mismo día del mes, o el último día del mes si ese mes es más corto (el 31 de
 * diciembre más 2 meses da el 28 de febrero). Si cae en sábado o domingo, pasa al día hábil siguiente (art. 62 de la
 * Ley 4 de 1913); la demo no descuenta los festivos.
 */
export function termInMonths(from: string, months: number) {
  const limit = new Date(`${addMonths(from, months)}T12:00:00Z`)
  while (limit.getUTCDay() % 6 === 0) limit.setUTCDate(limit.getUTCDate() + 1)
  return limit.toISOString().slice(0, 10)
}

/** Último día para consignar la ReteICA o la AutoReteICA: dos meses después del vencimiento. */
export const remittanceLimit = (dueDateItem: string) => termInMonths(dueDateItem, MONTHS_TO_REMIT)

/**
 * ICA anual admite pago parcial y saldo a favor; ReteICA y autorretención sin pago total son ineficaces y no
 * producen saldo a favor. Si el municipio da el plazo de 2 meses (art. 580-1 ET), la que se presentó a tiempo no es
 * ineficaz mientras ese plazo no pase: queda sin pago o con pago parcial.
 */
export function paymentStatus(
  declaration: Declaration,
  payments: Payment[],
  cfg: MunicipalityConfig | undefined,
  today: string,
): PaymentStatus {
  const paidAmount = totalPaid(declaration.id, payments)
  if (declaration.tax === 'ica') {
    if (declaration.totalToPay === 0)
      return declaration.creditBalance > 0 ? 'credit_balance' : 'paid'
    if (paidAmount >= declaration.totalToPay) return 'paid'
    return paidAmount > 0 ? 'partial' : 'no_payment'
  }
  if (paidAmount >= declaration.totalToPay) return 'paid'
  const onTime =
    cfg?.withholdingPaymentInTwoMonths &&
    declaration.filingDate <= declaration.dueDate &&
    today <= remittanceLimit(declaration.dueDate)
  if (onTime) return paidAmount > 0 ? 'partial' : 'no_payment'
  return 'ineffective'
}

/** Descuento por pronto pago del año gravable para un pago en esa fecha; 0 si no cae en ningún tramo. */
export function earlyPaymentPercentage(cfg: MunicipalityConfig, fiscalYear: number, date: string) {
  if (!cfg.earlyPayment.isActive) return 0
  const tiers = cfg.earlyPayment.byFiscalYear.find((v) => v.fiscalYear === fiscalYear)?.tiers ?? []
  return tiers.find((t) => t.from <= date && date <= t.to)?.percentage ?? 0
}

/** Suma días hábiles (resta, si son negativos): de lunes a viernes. La demo no descuenta los festivos. */
export function addBusinessDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`)
  for (let missing = Math.abs(days); missing > 0;) {
    d.setUTCDate(d.getUTCDate() + Math.sign(days))
    if (d.getUTCDay() % 6 !== 0) missing--
  }
  return d.toISOString().slice(0, 10)
}

/** Días hábiles que faltan de `desde` a `hasta`; 0 si es el mismo día, negativo si ya pasó. */
export function businessDaysBetween(from: string, to: string): number {
  if (to < from) return -businessDaysBetween(to, from)
  let days = 0
  while (addBusinessDays(from, days + 1) <= to) days++
  return days
}

export interface ApprovalSituation {
  status: ApprovalStatus
  /** Último día para aprobar o rechazar. */
  limit: string
  /** Día en que se resolvió; en la aprobación automática, el día límite. */
  date?: string
  by?: string
  observation?: string
  /** Solo en la rechazada: la causal del art. 580. */
  ground?: NotFiledGround
  documents?: StoredFile[]
  /** Hasta cuándo vale el recibo de pago que se envía al aprobar. */
  receiptUntil?: string
}

/**
 * Aprobación previa de la declaración al día de hoy. El plazo cuenta desde la radicación y, si
 * se radicó a tiempo, no pasa del vencimiento. Vencido el plazo sin revisión, el municipio decide
 * si se aprueba sola o solo se alerta. Descuento, sanciones e intereses se liquidan con la fecha
 * de radicación: la demora del municipio no se le cobra al contribuyente.
 */
export function approvalOf(
  d: Declaration,
  cfg: MunicipalityConfig,
  today: string,
): ApprovalSituation | undefined {
  if (!d.approval) return undefined
  const { termBusinessDays, onDue, receiptValidityBusinessDays } = cfg.priorApproval
  const term = addBusinessDays(d.filingDate, termBusinessDays)
  const limit = d.filingDate <= d.dueDate && d.dueDate < term ? d.dueDate : term
  const receiptUntil = (date: string) => addBusinessDays(date, receiptValidityBusinessDays)
  const a = d.approval
  if (a.status === 'approved') return { ...a, limit, receiptUntil: receiptUntil(a.date) }
  if (a.status === 'rejected') return { ...a, limit }
  if (today <= limit) return { status: 'pending_approval', limit }
  return onDue === 'approve'
    ? { status: 'auto_approved', limit, date: limit, receiptUntil: receiptUntil(limit) }
    : { status: 'overdue', limit }
}

/** Mientras no se apruebe, el contribuyente no puede pagar: la declaración aún no es deuda. */
export const canBePaid = (a: ApprovalSituation | undefined) =>
  !a || a.status === 'approved' || a.status === 'auto_approved'

/** Espera la aprobación previa: mientras tanto el contribuyente no puede pagar. */
export const awaitsApproval = (a: ApprovalSituation | undefined) =>
  a?.status === 'pending_approval' || a?.status === 'overdue'

// --- Corrección a la baja (art. 589 del Estatuto Tributario) ---

/** Plazo para corregir a la baja: el año siguiente al vencimiento del plazo para declarar (art. 589). */
export const MONTHS_FOR_DOWNWARD_CORRECTION = 12

/** Meses que tiene el municipio para resolver la solicitud de corrección a la baja; si no responde, se acepta sola (art. 589 anterior). */
export const MONTHS_TO_RESOLVE_CORRECTION = 6

/**
 * Sanción por rechazar por improcedente la solicitud de corrección a la baja: 20 % del menor valor que se pidió (art. 589
 * anterior). La impone la administración en el mismo acto, después de un proceso previo (Corte Constitucional, C-005 de
 * 1998); el dashboard solo la informa.
 */
export const CORRECTION_REJECTION_PENALTY = 0.2

/** Código del renglón con lo que se pagó con la declaración que se corrige: la corrección lo trae como crédito. */
export const PAID_WITH_CORRECTED_CODE = '—'

/**
 * Valor a pagar que liquida la declaración: el total del ICA anual (renglón 38) o de la retención, antes de restar lo
 * que se pagó con la declaración que corrige.
 */
export const calculatedValue = (d: Declaration) =>
  d.lines.find((r) => r.code === '38' || r.code === 'T')?.value ?? d.totalToPay

/** Renglón del impuesto a cargo, sobre el que se liquida la extemporaneidad: el total del ICA o el subtotal de la retención. */
const TAX_LINE: Record<Tax, string> = { ica: '25', reteica: '18', selfWithholding: '2' }

export const taxDue = (d: Declaration) =>
  d.lines.find((r) => r.code === TAX_LINE[d.tax])?.value ?? 0

/** Las sanciones que liquida la declaración: el renglón 31 del ICA o la "S" de la retención. */
export const calculatedPenalty = (d: Declaration) =>
  d.lines.filter((r) => r.code === '31' || r.code === 'S').reduce((sum, r) => sum + r.value, 0)

/**
 * La corrección baja el valor a pagar o sube el saldo a favor de la declaración que corrige. El valor a pagar es el
 * resultado final de la liquidación, no solo el impuesto a cargo (DIAN, conceptos 901809 de 2021 y 13304 de 2025).
 */
export const isDownwardCorrection = (d: Declaration, corrected: Declaration | undefined) =>
  d.kind === 'correction' &&
  corrected !== undefined &&
  (calculatedValue(d) < calculatedValue(corrected) || d.creditBalance > corrected.creditBalance)

/** Lo que la corrección le baja al valor a pagar, más lo que le sube al saldo a favor. */
export const lowestValue = (d: Declaration, corrected: Declaration) =>
  Math.max(calculatedValue(corrected) - calculatedValue(d), 0) +
  Math.max(d.creditBalance - corrected.creditBalance, 0)

/**
 * Lo que se pagó con la declaración que se corrige por encima de lo que liquida la corrección. Es un pago en exceso, no
 * un saldo a favor de la declaración: el contribuyente lo pide en devolución o compensación.
 */
export const overpayment = (d: Declaration) =>
  Math.max(
    (d.lines.find((r) => r.code === PAID_WITH_CORRECTED_CODE)?.value ?? 0) - calculatedValue(d),
    0,
  )

/** Último día para corregir a la baja: un año después del vencimiento, o el día hábil siguiente. */
export const downwardCorrectionLimit = (dueDateItem: string) =>
  termInMonths(dueDateItem, MONTHS_FOR_DOWNWARD_CORRECTION)

export interface CorrectionSituation {
  status: CorrectionStatus
  /** Último día para resolverla. Después se acepta sola. */
  limit: string
  /** Día en que se resolvió; en la aceptación por silencio, el día límite. */
  date?: string
  by?: string
  observation?: string
  /** Lo que explica el contribuyente al radicarla. */
  reason: string
}

/**
 * Solicitud de corrección a la baja al día de hoy, con el trámite del art. 589 anterior a la Ley 1819 de 2016: el
 * municipio tiene 6 meses desde la radicación para aceptarla o rechazarla y, si no responde, el proyecto reemplaza a la
 * declaración (silencio positivo). Es undefined en las declaraciones que no se radicaron como solicitud.
 */
export function correctionSituation(
  d: Declaration,
  today: string,
): CorrectionSituation | undefined {
  const s = d.correctionApplication
  if (!s) return undefined
  const limit = termInMonths(d.filingDate, MONTHS_TO_RESOLVE_CORRECTION)
  if (s.status !== 'pending') return { ...s, limit }
  if (today <= limit) return { status: 'to_resolve', limit, reason: s.reason }
  return { status: 'accepted_by_silence', limit, date: limit, reason: s.reason }
}

/** La corrección reemplaza a la que corrige: no es una solicitud, o se aceptó, expresamente o por silencio. */
export const currentCorrection = (s: CorrectionSituation | undefined) =>
  !s || s.status === 'accepted' || s.status === 'accepted_by_silence'

/** Espera que el municipio la resuelva: si no lo hace antes del límite, se acepta sola. */
export const correctionToResolve = (s: CorrectionSituation | undefined) =>
  s?.status === 'to_resolve'

/**
 * Las declaraciones que reemplazó una corrección vigente. La solicitud de corrección que no se ha aceptado no reemplaza
 * a la que corrige: esa sigue vigente.
 */
export const replaced = (
  declarations: Declaration[],
  situation: (d: Declaration) => CorrectionSituation | undefined,
) =>
  new Set(
    declarations.flatMap((d) =>
      d.correctsId && currentCorrection(situation(d)) ? [d.correctsId] : [],
    ),
  )

export const roundToThousand = (value: number) => Math.round(value / 1000) * 1000

/** Renglones de subtotal y total de la liquidación (se resaltan en pantalla y en el PDF). */
export const TOTAL_LINES = new Set(['16', '25', '33', '34', '38', '18', 'T'])

/** El trámite más reciente del RIT: inscripción, actualización o cancelación. */
export const lastProcedure = (i: Registration) =>
  i.ritChanges.reduce((last, n) => (n.date >= last.date ? n : last))

/**
 * Días de retraso de una inscripción en el RIT: el plazo corre desde el inicio de actividades (docs/Pendientes-y-decisiones.md §3.3).
 * Es null si se inscribió a tiempo o si el plazo vencía antes de que el RIT saliera a producción: entonces le tocaba
 * inscribirse en el sistema anterior y el aplicativo no sabe si lo hizo.
 */
export function lateRegistrationDays(
  activitiesStart: string,
  filingNumber: string,
  termMonths: number,
  ritSince: string,
) {
  const limit = addMonths(activitiesStart, termMonths)
  if (limit < ritSince || filingNumber <= limit) return null
  return { limit, days: dayDifference(limit, filingNumber) }
}
