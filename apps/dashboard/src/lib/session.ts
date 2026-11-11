import { useMemo } from 'react'
import { useData } from '../store'
import type {
  MunicipalityConfig,
  Declaration,
  Form,
  Tax,
  TellerMethods,
  Municipality,
} from '../types'
import { today } from '../utils'
import { municipalitiesWithoutCalendar } from './calendar'
import { computeUnremitted } from './remittance'
import { computeNonFilers } from './nonFilers'
import { approvalOf, paymentStatus, correctionSituation } from './rules'

export const TAXES: Tax[] = ['ica', 'reteica', 'selfWithholding']

/** Formularios que 1cero1 tiene activos en el municipio: el RIT y los de sus impuestos. */
export const formsOf = (m: Municipality): Form[] => [
  ...(m.rit ? ['rit' as const] : []),
  ...TAXES.filter((i) => m.taxes[i]),
]

/**
 * Usuario en sesión y municipio que está viendo. Los roles municipales solo ven
 * el suyo; 1cero1 ve el que elija en el buscador de cada vista (null = todos).
 */
export function useSession() {
  const userId = useData((s) => s.userId)
  const users = useData((s) => s.users)
  const selectedMunicipality = useData((s) => s.selectedMunicipality)
  const user = users.find((u) => u.id === userId) ?? null
  const municipalityId =
    user?.role === '1cero1' ? selectedMunicipality : (user?.municipalityId ?? null)
  return { user, municipalityId }
}

/**
 * Si el usuario ve lo recaudado por el municipio. El administrador decide en Configuración
 * si los funcionarios lo ven; si no hay configuración, no lo ven.
 */
export function useCanSeeCollection() {
  const { user, municipalityId } = useSession()
  const settingsList = useData((s) => s.settingsList)
  const hide =
    settingsList.find((c) => c.municipalityId === municipalityId)?.hideCollectionFromOfficials ??
    true
  return user?.role !== 'official' || !hide
}

export const ofMunicipality = <T extends { municipalityId: string | null }>(
  list: T[],
  municipalityId: string | null,
) =>
  municipalityId === null ? list : list.filter((item) => item.municipalityId === municipalityId)

/** Filtro: el municipio del registro tiene activo ese impuesto. */
export function activeTax(municipalities: Municipality[]) {
  const byId = new Map(municipalities.map((m) => [m.id, m.taxes]))
  return (item: { municipalityId: string; tax: Tax }) =>
    byId.get(item.municipalityId)?.[item.tax] ?? false
}

/** Impuestos que se ven: los del municipio elegido, o los de cualquiera cuando 1cero1 mira todos. */
export const visibleTaxes = (municipalities: Municipality[], municipalityId: string | null) =>
  TAXES.filter((i) =>
    municipalities.some((m) => (municipalityId === null || m.id === municipalityId) && m.taxes[i]),
  )

/** El RIT se ve si el municipio elegido lo tiene activo, o si alguno lo tiene cuando 1cero1 mira todos. */
export const ritVisible = (municipalities: Municipality[], municipalityId: string | null) =>
  municipalities.some((m) => (municipalityId === null || m.id === municipalityId) && m.rit)

/** La aprobación previa se ve si algún formulario activo del municipio elegido la tiene, o de cualquiera cuando 1cero1 mira todos. */
export const approvalVisible = (municipalities: Municipality[], municipalityId: string | null) =>
  municipalities.some(
    (m) =>
      (municipalityId === null || m.id === municipalityId) &&
      TAXES.some((i) => m.taxes[i] && m.priorApproval[i]),
  )

/**
 * Las solicitudes de corrección a la baja se ven si el municipio elegido corrige a la baja con el trámite del art. 589
 * anterior, o si alguno lo hace cuando 1cero1 mira todos.
 */
export const correctionApplicationVisible = (
  settingsList: MunicipalityConfig[],
  municipalityId: string | null,
) =>
  settingsList.some(
    (c) =>
      (municipalityId === null || c.municipalityId === municipalityId) &&
      c.downwardCorrection === 'project_589',
  )

/** La carga del Asobancaria 2001 se ve si el municipio elegido la tiene, o si alguno la tiene cuando 1cero1 mira todos. */
export const asobancariaUploadVisible = (
  municipalities: Municipality[],
  municipalityId: string | null,
) =>
  municipalities.some(
    (m) => (municipalityId === null || m.id === municipalityId) && m.asobancariaUpload,
  )

/** Medios que el municipio recibe en su ventanilla para el formulario de ese impuesto. */
export const tellerOf = (m: Municipality | undefined, tax: Tax): TellerMethods => ({
  cash: Boolean(m?.cashPayment[tax]),
  check: Boolean(m?.checkPayment[tax]),
})

/** El municipio recibe cheques de gerencia en alguno de sus formularios activos. */
export const acceptsChecks = (m: Municipality | undefined) =>
  TAXES.some((i) => m?.taxes[i] && m.checkPayment[i])

/** Los cheques se ven si el municipio elegido los recibe, o si alguno los recibe cuando 1cero1 mira todos. */
export const visibleChecks = (municipalities: Municipality[], municipalityId: string | null) =>
  municipalities.some(
    (m) => (municipalityId === null || m.id === municipalityId) && acceptsChecks(m),
  )

/** Filtro: el municipio del registro tiene el RIT en el aplicativo. */
export function withRit(municipalities: Municipality[]) {
  const ids = new Set(municipalities.filter((m) => m.rit).map((m) => m.id))
  return (item: { municipalityId: string }) => ids.has(item.municipalityId)
}

/** Si la declaración se valida contra el RIT: el municipio tiene el RIT y la validación activa en ese formulario. */
export function isValidatedAgainstRit(
  municipalities: Municipality[],
  d: { municipalityId: string; tax: Tax },
) {
  const m = municipalities.find((x) => x.id === d.municipalityId)
  return Boolean(m?.rit && m.validateAgainstRit[d.tax])
}

/** Declaraciones del municipio que se está viendo, solo de los impuestos que tiene activos. */
export function useDeclarations() {
  const { municipalityId } = useSession()
  const declarations = useData((s) => s.declarations)
  const municipalities = useData((s) => s.municipalities)
  return useMemo(
    () => ofMunicipality(declarations, municipalityId).filter(activeTax(municipalities)),
    [declarations, municipalities, municipalityId],
  )
}

/** Aprobación previa de cada declaración al día de hoy, según la configuración de su municipio. */
export function useApproval() {
  const settingsList = useData((s) => s.settingsList)
  return useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const byMunicipality = new Map(settingsList.map((c) => [c.municipalityId, c]))
    return (d: Declaration) => {
      const cfg = byMunicipality.get(d.municipalityId)
      return cfg && approvalOf(d, cfg, today)
    }
  }, [settingsList])
}

/** Solicitud de corrección a la baja de cada declaración al día de hoy: si pasan los 6 meses sin respuesta, se acepta sola. */
export function useCorrectionApplication() {
  const date = today()
  return useMemo(() => (d: Declaration) => correctionSituation(d, date), [date])
}

/** Estado del pago de cada declaración al día de hoy, con el plazo de 2 meses de la retención si su municipio lo da. */
export function usePaymentStatus() {
  const payments = useData((s) => s.payments)
  const settingsList = useData((s) => s.settingsList)
  const date = today()
  return useMemo(() => {
    const byMunicipality = new Map(settingsList.map((c) => [c.municipalityId, c]))
    return (d: Declaration) =>
      paymentStatus(d, payments, byMunicipality.get(d.municipalityId), date)
  }, [payments, settingsList, date])
}

/**
 * ReteICA y AutoReteICA sin consignar al día de hoy: de todas las declaraciones que se indiquen o, si no, de las del
 * municipio que se está viendo.
 */
export function useUnremitted(list?: Declaration[]) {
  const visible = useDeclarations()
  const declarations = list ?? visible
  const payments = useData((s) => s.payments)
  const checks = useData((s) => s.checks)
  const approval = useApproval()
  const correction = useCorrectionApplication()
  const date = today()
  return useMemo(
    () => computeUnremitted({ declarations, payments, checks, approval, correction }, date),
    [declarations, payments, checks, approval, correction, date],
  )
}

/** El año en curso y los municipios que se están viendo que aún no cargan su calendario de ese año. */
export function useWithoutCalendar() {
  const { municipalityId } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const settingsList = useData((s) => s.settingsList)
  const year = Number(today().slice(0, 4))
  const missing = useMemo(
    () => municipalitiesWithoutCalendar(municipalities, settingsList, municipalityId, year),
    [municipalities, settingsList, municipalityId, year],
  )
  return { year, municipalities: missing }
}

/**
 * Omisos al día de hoy: del municipio que se está viendo (o de todos, si 1cero1 no eligió uno), o del que se indique,
 * como el de una inscripción.
 */
export function useNonFilers(municipality?: string | null) {
  const session = useSession()
  const municipalityId = municipality === undefined ? session.municipalityId : municipality
  const municipalities = useData((s) => s.municipalities)
  const settingsList = useData((s) => s.settingsList)
  const registrations = useData((s) => s.registrations)
  const declarations = useData((s) => s.declarations)
  const date = today()
  return useMemo(
    () =>
      computeNonFilers(
        { municipalities, settingsList, registrations, declarations },
        municipalityId,
        date,
      ),
    [municipalities, settingsList, registrations, declarations, municipalityId, date],
  )
}
