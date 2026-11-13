import { PERIOD_NAMES } from '../constants/calendar'
import type {
  Capacity,
  Summons,
  ApprovalStatus,
  CheckStatus,
  CorrectionStatus,
  SummonsStatus,
  RegistrationStatus,
  RitChangeStatus,
  PaymentStatus,
  AccountingSigner,
  Form,
  Tax,
  Registration,
  Municipality,
  Frequency,
  Role,
  Sector,
  DeclarationKind,
  RitChangeKind,
  PersonType,
  User,
} from '../types'

const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})
const upToOneDecimal = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 1,
  useGrouping: 'always',
})
const date = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
const hourMinutes = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' })
const list = new Intl.ListFormat('es-CO', { type: 'conjunction' })

export const formatPesos = (value: number) => pesos.format(value)
const MILLION = 1_000_000
const BILLION = 1_000_000_000_000
/** Espacio duro, para que la unidad no quede sola en otra línea. */
const NBSP = String.fromCharCode(160)
/** Redondea a un decimal con el mismo criterio para negativos: -1,25 M da -1,3 M, igual que 1,25 M da 1,3 M. */
const oneDecimal = (n: number) => (Math.sign(n) * Math.round(Math.abs(n) * 10)) / 10
/** Si compactFormat abrevia el valor; en ese caso conviene mostrar el exacto en un Tooltip. */
export const isCompacted = (value: number) => Math.abs(value) >= MILLION
/**
 * Valor corto para las cards y las gráficas, sin "K" ni "mil" (la RAE no los recomienda en cifras): por debajo de un
 * millón va completo ("900.000"); desde ahí en millones con un decimal ("1,3 M", "1.500 M") y desde un billón
 * colombiano (10¹²) en billones ("2,3 billones"). Lleva espacio duro para que la unidad no se separe del número.
 */
export function compactFormat(value: number) {
  if (!isCompacted(value)) return upToOneDecimal.format(Math.round(value))
  const millions = oneDecimal(value / MILLION)
  // 999.999.950.000 redondea a "1.000.000 M": ahí ya se lee en billones.
  if (Math.abs(millions) < MILLION) return `${upToOneDecimal.format(millions)}${NBSP}M`
  const billions = oneDecimal(value / BILLION)
  return `${upToOneDecimal.format(billions)}${NBSP}${Math.abs(billions) === 1 ? 'billón' : 'billones'}`
}
export const formatDate = (iso: string) => date.format(new Date(`${iso}T12:00:00`))
/** Hora de un registro AAAA-MM-DDTHH:MM, como "1:12 a. m.". */
export const formatTime = (dateTime: string) => hourMinutes.format(new Date(`${dateTime}:00`))
/** "A", "A y B", "A, B y C". */
export const formatList = (texts: string[]) => list.format(texts)
/** "hace 1 día", "hace 12 días". */
export const formatDaysAgo = (days: number) => (days === 1 ? 'hace 1 día' : `hace ${days} días`)
/** Cuánto le queda al plazo para consignar la retención: "Faltan 14 días", "Vence hoy", "Venció hace 3 días". */
export const remittanceTerm = (days: number) =>
  days < 0
    ? `Venció ${formatDaysAgo(-days)}`
    : days === 0
      ? 'Vence hoy'
      : days === 1
        ? 'Falta 1 día'
        : `Faltan ${days} días`
/** Para comparar textos sin importar tildes, mayúsculas ni espacios de los extremos. */
export const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()

/** Meses abreviados, para las gráficas. */
export const MONTHS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

export const roleLabel: Record<Role, string> = {
  '1cero1': '1cero1',
  municipality_admin: 'Administrador municipio',
  official: 'Funcionario municipio',
}

export const fullName = (u: Pick<User, 'firstNames' | 'lastNames'>) =>
  `${u.firstNames} ${u.lastNames}`

/** Número de documento, con el dígito de verificación si lo tiene. */
export const documentNumber = (d: Pick<Registration, 'document' | 'dv'>) =>
  `${d.document}${d.dv ? `-${d.dv}` : ''}`

/** Tipo y número de documento, con el dígito de verificación si lo tiene. */
export const documentFormat = (d: Pick<Registration, 'documentType' | 'document' | 'dv'>) =>
  `${d.documentType} ${documentNumber(d)}`

export const documentTypeLabel: Record<Registration['documentType'], string> = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  NIT: 'NIT',
}

export const personTypeLabel: Record<PersonType, string> = {
  natural: 'Persona natural',
  legal: 'Persona jurídica',
  consortium: 'Consorcio',
  temporary_union: 'Unión temporal',
  autonomous_trust: 'Patrimonio autónomo',
}

export const accountingPositionLabel: Record<AccountingSigner['jobTitle'], string> = {
  accountant: 'Contador',
  statutory_auditor: 'Revisor fiscal',
}

export const capacityLabel: Record<Capacity, string> = {
  taxpayer: 'Contribuyente',
  withholding_agent: 'Agente retenedor',
  self_withholder: 'Autorretenedor',
}

export const registrationStatusLabel: Record<RegistrationStatus, string> = {
  under_review: 'En revisión',
  active: 'Activa',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
}

export const ritChangeKindLabel: Record<RitChangeKind, string> = {
  registration: 'Inscripción',
  update: 'Actualización',
  cancellation: 'Cancelación',
}

/** Nombre del trámite en los archivos que se descargan (lo ve el usuario). */
export const RIT_CHANGE_FILE_NAMES: Record<RitChangeKind, string> = {
  registration: 'inscripcion',
  update: 'actualizacion',
  cancellation: 'cancelacion',
}

export const ritChangeStatusLabel: Record<RitChangeStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

export const sectorLabel: Record<Sector, string> = {
  industrial: 'Industrial',
  commercial: 'Comercial',
  services: 'Servicios',
  financial: 'Financiero',
}

export const taxLabel: Record<Tax, string> = {
  ica: 'ICA anual',
  reteica: 'ReteICA',
  selfWithholding: 'AutoReteICA',
}

export const formLabel: Record<Form, string> = { rit: 'RIT', ...taxLabel }

export const declarationTypeLabel: Record<DeclarationKind, string> = {
  initial: 'Inicial',
  correction: 'Corrección',
  closure: 'Clausura',
}

/** El tipo de la declaración; la corrección que baja el valor a pagar se llama "Corrección a la baja". */
export const declarationTypeText = (kind: DeclarationKind, downward: boolean) =>
  downward ? 'Corrección a la baja' : declarationTypeLabel[kind]

export const approvalStatusLabel: Record<ApprovalStatus, string> = {
  pending_approval: 'Por aprobar',
  overdue: 'Aprobación vencida',
  approved: 'Aprobada',
  auto_approved: 'Aprobada automáticamente',
  rejected: 'Rechazada',
}

export const correctionStatusLabel: Record<CorrectionStatus, string> = {
  to_resolve: 'Por resolver',
  accepted: 'Aceptada',
  accepted_by_silence: 'Aceptada por silencio',
  rejected: 'Rechazada',
}

export const summonsTypeLabel: Record<Summons['kind'], string> = {
  file: 'Emplazamiento para declarar',
  correct: 'Emplazamiento para corregir',
}

export const summonsStatusLabel: Record<SummonsStatus, string> = {
  on_time: 'En plazo',
  overdue: 'Plazo vencido',
  declared: 'Declarado',
  no_reply: 'Sin respuesta',
  corrected: 'Corregido',
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  paid: 'Pagada',
  partial: 'Pago parcial',
  no_payment: 'Sin pago',
  credit_balance: 'Saldo a favor',
  ineffective: 'Ineficaz (sin pago total)',
}

export const checkStatusLabel: Record<CheckStatus, string> = {
  in_clearing: 'En canje',
  paid: 'Pagado',
  returned: 'Devuelto',
}

export const frequencyLabel: Record<Frequency, string> = {
  annual: 'Anual',
  monthly: 'Mensual',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
}

/**
 * Nombre del periodo, el mismo en declaraciones, omisos y vencimientos: el año gravable en el ICA anual; en ReteICA y
 * AutoReteICA, el mes, el bimestre o el trimestre con sus meses y su año, como "Bimestre 3 (may – jun) de 2026".
 */
export const periodLabel = ({
  tax,
  frequency,
  fiscalYear,
  period,
}: {
  tax: Tax
  frequency: Frequency
  fiscalYear: number
  period: number
}) =>
  tax === 'ica'
    ? `Año gravable ${fiscalYear}`
    : `${PERIOD_NAMES[frequency][period - 1]} de ${fiscalYear}`

/** La fecha de salida a producción de un formulario, de solo lectura; sin fecha, el formulario nunca se ha activado. */
export const goLiveText = (date: string | undefined) =>
  date ? `En producción desde el ${formatDate(date)}` : 'Nunca se ha activado'

/**
 * Desde cuándo recibe el aplicativo los impuestos activos del municipio: "el 1 feb 2026" si todos salieron el mismo día,
 * o "el 1 feb 2026 (ICA) y el 1 mar 2026 (ReteICA)" si no. Es null si el municipio no tiene ningún impuesto activo.
 */
export function inProductionText(m: Municipality) {
  const byDate = new Map<string, string[]>()
  for (const i of Object.keys(taxLabel) as Tax[]) {
    const date = m.taxes[i] && m.inProductionSince[i]
    if (date) byDate.set(date, [...(byDate.get(date) ?? []), taxLabel[i]])
  }
  const groups = [...byDate].sort(([a], [b]) => a.localeCompare(b))
  if (groups.length === 0) return null
  if (groups.length === 1) return `el ${formatDate(groups[0][0])}`
  return formatList(
    groups.map(([f, firstNames]) => `el ${formatDate(f)} (${formatList(firstNames)})`),
  )
}
