// Genera los datos de la demo con una semilla fija: siempre salen los mismos.
import { MONTHS_PER_PERIOD } from '../constants'
import { dueDateFor } from '../lib/calendar'
import { computeNonFilers } from '../lib/nonFilers'
import { capacityLabel, formatPesos, fullName } from '../lib/format'
import {
  PAID_WITH_CORRECTED_CODE,
  remittanceLimit,
  downwardCorrectionLimit,
  earlyPaymentPercentage,
  roundToThousand,
  lateFilingPenalty,
  addBusinessDays,
  UVT,
  calculatedValue,
} from '../lib/rules'
import type {
  StoredFile,
  Capacity,
  Check,
  RegisteredCapacity,
  MunicipalityConfig,
  Data,
  RitData,
  Declaration,
  SummonsDestination,
  Summons,
  RegistrationStatus,
  Signer,
  Tax,
  Registration,
  Municipality,
  RitChange,
  NonFiler,
  Payment,
  Frequency,
  MonthlyCollection,
  Line,
  CorrectionApplication,
  Rate,
  PersonType,
} from '../types'
import { dayDifference, addMonths } from '../utils'
import {
  ACTIVITIES,
  ACTIVITIES_BY_FISCAL_YEAR,
  LAST_NAMES,
  STREETS,
  SETTINGS,
  COMPANIES,
  MARKS,
  MUNICIPALITIES,
  FIRST_NAMES,
  USERS,
} from './catalogs'
import { createRandom, randomDate, addDays } from './random'
import type { Random } from './random'
import { generateAuditLog } from './auditLog'

const REGISTRATIONS_BY_MUNICIPALITY = 40
/** Donde la ReteICA no se valida contra el RIT, sociedades que la declaran sin haberse inscrito. */
const UNREGISTERED_AGENTS = 3
const DEMO_DATE = '2026-10-21'

const smaller = (a: string, b: string) => (a < b ? a : b)

/** Los vencimientos de un formulario en el año gravable, según el calendario que trae la demo para el municipio. */
const formOf = (cfg: MunicipalityConfig, tax: Tax, fiscalYear: number) =>
  cfg.taxCalendar.byFiscalYear.find((c) => c.fiscalYear === fiscalYear)![tax]

/** Vencimiento del ICA anual del año gravable para el contribuyente: la fecha única o la de su último dígito. */
function icaDueDate(cfg: MunicipalityConfig, fiscalYear: number, document: string) {
  const f = formOf(cfg, 'ica', fiscalYear)
  return dueDateFor(f, f.periods[0], document)!
}

/**
 * Periodos de ReteICA o AutoReteICA del año gravable que ya vencieron a la fecha de la demo para el contribuyente, con
 * la periodicidad y el vencimiento (el de su último dígito, si el calendario los separa) del calendario.
 */
function overduePeriods(cfg: MunicipalityConfig, tax: Tax, fiscalYear: number, document: string) {
  const f = formOf(cfg, tax, fiscalYear)
  return f.periods.flatMap((p) => {
    const dueDateItem = dueDateFor(f, p, document)
    return dueDateItem && dueDateItem <= DEMO_DATE
      ? [{ frequency: f.frequency, period: p.period, dueDateItem }]
      : []
  })
}

/** La calidad del RIT que obliga a presentar cada formulario de retención. */
const WITHHOLDING_CAPACITY = {
  reteica: 'withholding_agent',
  selfWithholding: 'self_withholder',
} as const

/** Cómo se llama la duración del periodo en los renglones: "Base gravable del mes". */
const DURATION: Record<Frequency, string> = {
  annual: 'año',
  monthly: 'mes',
  bimonthly: 'bimestre',
  quarterly: 'trimestre',
}

/**
 * Cada declaración sorteaba un estado de revisión, que ya no existe. Se conservan esos sorteos
 * para que el resto de los datos de la demo no cambie.
 */
function reviewDraw(az: Random, pendingProb: number) {
  if (!az.prob(pendingProb) && az.prob(0.15)) az.num()
}

// --- RIT ---

function subjectName(az: Random, kind: PersonType) {
  switch (kind) {
    case 'natural':
      return `${az.pick(FIRST_NAMES)} ${az.pick(LAST_NAMES)} ${az.pick(LAST_NAMES)}`
    case 'legal':
      return `${az.pick(COMPANIES)} ${az.pick(MARKS)} S.A.S.`
    case 'consortium':
      return `Consorcio Vial ${az.pick(MARKS)}`
    case 'temporary_union':
      return `Unión Temporal ${az.pick(MARKS)} ${az.integer(2021, 2025)}`
    case 'autonomous_trust':
      return `Patrimonio Autónomo Fideicomiso ${az.pick(MARKS)}`
  }
}

function fileName(name: string) {
  const base = name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\(.*?\)/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
  return `${base}.pdf`
}

function randomFile(az: Random, name: string, date: string): StoredFile {
  return { name: fileName(name), size: az.integer(80_000, 2_400_000), uploadDate: date }
}

const ANNEXES: Record<Tax, string[]> = {
  ica: [
    'Anexo de ingresos por actividad',
    'Certificados de retención de ICA',
    'Soporte de deducciones y exenciones',
  ],
  reteica: ['Relación de retenciones practicadas'],
  selfWithholding: ['Relación de bases de autorretención'],
}

/** Documento que acredita la calidad, en la inscripción o en la actualización que la agrega. */
const CAPACITY_SUPPORT: Partial<Record<Capacity, string>> = {
  withholding_agent: 'Acto que acredita la calidad de agente retenedor',
  self_withholder: 'Resolución de designación como autorretenedor',
}

function requiredSupports(kind: PersonType, capacities: Capacity[]) {
  const list =
    kind === 'natural'
      ? ['Formulario RIT', 'Copia del RUT', 'Copia de la cédula']
      : [
          'Formulario RIT',
          'Copia del RUT',
          'Certificado de existencia y representación legal (máx. 30 días)',
          'Cédula del representante legal',
        ]
  if (capacities.includes('withholding_agent')) list.push(CAPACITY_SUPPORT.withholding_agent!)
  if (capacities.includes('self_withholder')) list.push(CAPACITY_SUPPORT.self_withholder!)
  return list
}

const randomAddress = (az: Random) =>
  `${az.pick(STREETS)} ${az.integer(1, 120)} # ${az.integer(1, 99)}-${az.integer(1, 99)}`
const randomPhone = (az: Random) =>
  `3${az.integer(10, 25)} ${az.integer(100, 999)} ${az.integer(1000, 9999)}`

type Reason = { reason: string; supports: string[]; notForNaturalPersons?: boolean }

/** Motivos de actualización: el documento que pide cada uno y cómo estaba el dato antes del cambio. */
const UPDATE_REASONS: (Reason & { before: (az: Random, d: RitData) => Partial<RitData> })[] = [
  {
    reason: 'Cambio de dirección del establecimiento',
    supports: ['Copia del RUT actualizado'],
    before: (az) => ({ address: randomAddress(az) }),
  },
  {
    reason: 'Cambio del correo de notificación',
    supports: [],
    before: (az, d) => ({
      email: d.email.replace(
        /^\D+/,
        az.pick(['gerencia', 'admin', 'tesoreria', 'info'].filter((p) => !d.email.startsWith(p))),
      ),
    }),
  },
  {
    reason: 'Actualización de datos de contacto',
    supports: [],
    before: (az) => ({ phone: randomPhone(az) }),
  },
  {
    reason: 'Cambio de representante legal',
    supports: [
      'Certificado de existencia y representación legal (máx. 30 días)',
      'Cédula del representante legal',
    ],
    notForNaturalPersons: true,
    before: (az) => ({ legalRepresentative: `${az.pick(FIRST_NAMES)} ${az.pick(LAST_NAMES)}` }),
  },
]

const CANCELLATION_REASONS: Reason[] = [
  { reason: 'Cierre definitivo del establecimiento', supports: [] },
  { reason: 'Traslado de la actividad a otro municipio', supports: ['Copia del RUT actualizado'] },
  {
    reason: 'Venta del establecimiento de comercio',
    supports: ['Contrato de compraventa del establecimiento'],
  },
  {
    reason: 'Liquidación de la sociedad',
    supports: ['Certificado de liquidación de la sociedad'],
    notForNaturalPersons: true,
  },
]

const seed = (text: string) => [...text].reduce((h, c) => Math.imul(h, 31) + c.charCodeAt(0), 7)

/**
 * Llena lo que el contribuyente diligenció en cada solicitud del RIT. La inscripción tiene los datos del último
 * formulario aprobado; hacia atrás, cada actualización aprobada deshace su cambio. Agrega actualizaciones para que
 * haya historiales largos: las calidades que llegaron después de inscribirse y, en las canceladas, al menos dos.
 * Usa su propio azar para no cambiar el resto de los datos.
 */
function addForms(reg: Registration) {
  const az = createRandom(seed(reg.id))
  const isNatural = reg.personType === 'natural'
  const applies = (m: Reason) => !isNatural || !m.notForNaturalPersons
  const { ritChanges } = reg
  const registration = ritChanges[0]
  const uploadedOnes = (firstNames: string[], date: string) =>
    firstNames.map((name) => ({
      name,
      delivered: true,
      file: randomFile(az, name, date),
    }))
  const approved = (date: string, description: string, capacity?: Capacity) =>
    ritChanges.push({
      id: '',
      kind: 'update',
      date,
      description,
      capacity,
      status: 'approved',
      reviewedBy: registration.reviewedBy,
      reviewDate: addDays(date, 5),
      supports: [],
    })

  if (reg.status === 'active' || reg.status === 'cancelled') {
    for (const c of reg.capacities) {
      if (c.capacity !== 'taxpayer' && c.from > registration.date) {
        approved(
          addDays(c.from, az.integer(5, 40)),
          `Agrega la calidad de ${capacityLabel[c.capacity].toLowerCase()} (${c.act})`,
          c.capacity,
        )
      }
    }
    const cap =
      ritChanges.find((n) => n.kind === 'cancellation' || n.status === 'pending')?.date ??
      '2026-08-31'
    const from = addDays(registration.date, 60)
    const to = addDays(cap, -20)
    let missing =
      reg.status === 'cancelled'
        ? 2 - ritChanges.filter((n) => n.kind === 'update').length
        : az.prob(0.25)
          ? 1
          : 0
    while (missing-- > 0 && from < to)
      approved(randomDate(az, from, to), az.pick(UPDATE_REASONS.filter(applies)).reason)
    ritChanges.sort((a, b) => a.date.localeCompare(b.date))
    ritChanges.forEach((n, i) => (n.id = `${reg.id}-n${i + 1}`))
  }

  let inForce: RitData = structuredClone({
    personType: reg.personType,
    documentType: reg.documentType,
    document: reg.document,
    dv: reg.dv,
    name: reg.name,
    legalRepresentative: reg.legalRepresentative,
    address: reg.address,
    phone: reg.phone,
    email: reg.email,
    establishments: reg.establishments,
    accountant: reg.accountant,
    activitiesStartDate: reg.activitiesStartDate,
    simpleRegime: reg.simpleRegime,
    activities: reg.activities,
    capacities: reg.capacities,
  })
  for (const n of [...ritChanges].reverse()) {
    if (n.kind === 'cancellation') {
      const m = az.pick(CANCELLATION_REASONS.filter(applies))
      n.cancellation = { cessationDate: n.date, reason: m.reason }
      n.supports = uploadedOnes(['Solicitud de cancelación firmada', ...m.supports], n.date)
    } else if (n.kind === 'update' && n.status === 'pending') {
      // Aún no se aplica: pide lo vigente más la calidad nueva.
      n.data = structuredClone(inForce)
      n.data.capacities.push({
        capacity: n.capacity!,
        from: n.date,
        act: /\(([^)]+)\)/.exec(n.description)?.[1],
      })
      n.supports = uploadedOnes([CAPACITY_SUPPORT[n.capacity!]!], n.date)
    } else if (n.kind === 'update') {
      n.data = structuredClone(inForce)
      const reason = UPDATE_REASONS.find((m) => m.reason === n.description)
      n.supports = uploadedOnes(
        n.capacity ? [CAPACITY_SUPPORT[n.capacity]!] : reason!.supports,
        n.date,
      )
      inForce = n.capacity
        ? { ...inForce, capacities: inForce.capacities.filter((c) => c.capacity !== n.capacity) }
        : { ...inForce, ...reason!.before(az, inForce) }
    } else {
      n.data = structuredClone(inForce)
      const required = requiredSupports(
        reg.personType,
        inForce.capacities.map((c) => c.capacity),
      )
      n.supports = reg.supports.filter((s) => required.includes(s.name))
    }
  }
}

/**
 * Establecimientos en el municipio y contador o revisor fiscal del inscrito. Pocas personas naturales están obligadas
 * a llevar contabilidad, y algunas sociedades deben tener revisor fiscal. Usa su propio azar para no cambiar el resto
 * de los datos.
 */
function accountingData(
  id: string,
  kind: PersonType,
): Pick<Registration, 'establishments' | 'accountant'> {
  const az = createRandom(seed(`${id}-contable`))
  const establishments = az.pick(
    kind === 'natural'
      ? [0, 1, 1, 1, 1, 1, 1, 1, 2]
      : kind === 'legal'
        ? [1, 1, 1, 2, 2, 3, 4]
        : [0, 0, 1],
  )
  if (kind === 'natural' && !az.prob(0.3)) return { establishments }
  const foreign = az.prob(0.05)
  return {
    establishments,
    accountant: {
      jobTitle: kind === 'legal' && az.prob(0.35) ? 'statutory_auditor' : 'accountant',
      documentType: foreign ? 'CE' : 'CC',
      document: String(
        foreign ? az.integer(100_000, 9_999_999) : az.integer(10_000_000, 1_199_999_999),
      ),
      name: `${az.pick(FIRST_NAMES)} ${az.pick(LAST_NAMES)} ${az.pick(LAST_NAMES)}`,
      professionalCard: `${az.integer(10_000, 299_999)}-T`,
    },
  }
}

/**
 * Azar propio de las inscripciones de 2026 y de las fechas de las declaraciones, para no cambiar el resto de los datos.
 * generateData lo reinicia, para que cada vez salgan los mismos datos.
 */
let randomRecent = createRandom(2026)
/** Inscripciones de 2026 que van: cada una cae en el mes siguiente, de enero a octubre. */
let recentRegistrations = 0
const inMonth = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

function generateRegistration(az: Random, municipalityId: string, n: number): Registration {
  const id = `${municipalityId}-i${n}`
  const r = az.num()
  const personType: PersonType =
    r < 0.45
      ? 'natural'
      : r < 0.9
        ? 'legal'
        : r < 0.94
          ? 'consortium'
          : r < 0.97
            ? 'temporary_union'
            : 'autonomous_trust'
  const isNatural = personType === 'natural'
  const e = az.num()
  const status: RegistrationStatus =
    e < 0.78 ? 'active' : e < 0.9 ? 'under_review' : e < 0.95 ? 'rejected' : 'cancelled'
  const drawnStart =
    status === 'under_review'
      ? randomDate(az, '2026-07-01', '2026-10-15')
      : randomDate(az, '2008-01-01', '2024-06-30')
  // La mitad de las activas y rechazadas se inscribieron en 2026, una por mes en orden, para que haya inscripciones
  // todos los meses del año hasta la fecha de la demo.
  const recentRegistration =
    (status === 'active' || status === 'rejected') && randomRecent.prob(0.5)
      ? smaller(
          inMonth(2026, (recentRegistrations++ % 10) + 1, randomRecent.integer(1, 28)),
          '2026-10-15',
        )
      : undefined
  const startDate = recentRegistration
    ? addDays(recentRegistration, -randomRecent.integer(5, 120))
    : drawnStart

  const options = isNatural ? ACTIVITIES.filter((a) => a.sector !== 'financial') : ACTIVITIES
  const main = az.pick(options)
  const activities = [{ ciiu: main.ciiu, description: main.description, main: true }]
  if (az.prob(0.3)) {
    const otherOne = az.pick(options.filter((a) => a.ciiu !== main.ciiu))
    activities.push({ ciiu: otherOne.ciiu, description: otherOne.description, main: false })
  }

  const capacities: RegisteredCapacity[] = [{ capacity: 'taxpayer', from: startDate }]
  if (!isNatural && az.prob(0.35)) {
    const year = az.integer(2019, 2025)
    capacities.push({
      capacity: 'withholding_agent',
      from: `${year}-01-01`,
      act: `Resolución ${az.integer(100, 999)} de ${year}`,
    })
  }
  if (personType === 'legal' && az.prob(0.2)) {
    const year = az.integer(2018, 2025)
    capacities.push({
      capacity: 'self_withholder',
      from: `${year}-01-01`,
      act: `Resolución ${az.integer(100, 999)} de ${year}`,
    })
  }
  const simpleRegime = capacities.length === 1 && az.prob(isNatural ? 0.35 : 0.12)

  const reviewers = USERS.filter(
    (u) => u.municipalityId === municipalityId && u.role === 'official',
  )
  const reviewer = fullName(az.pick(reviewers))
  // Hasta 4 meses: con plazos de 2 y 3 meses, algunas de las recientes llegan tarde.
  const drawnDelay = az.integer(5, 120)
  const registrationDate = recentRegistration ?? addDays(startDate, drawnDelay)
  const ritChanges: RitChange[] = []
  const ritChange = (data: Omit<RitChange, 'id' | 'supports'>) =>
    ritChanges.push({ id: `${id}-n${ritChanges.length + 1}`, supports: [], ...data })

  if (status === 'under_review') {
    ritChange({
      kind: 'registration',
      date: smaller(registrationDate, DEMO_DATE),
      description: 'Solicitud de inscripción en el RIT',
      status: 'pending',
    })
  } else if (status === 'rejected') {
    ritChange({
      kind: 'registration',
      date: registrationDate,
      description: 'Solicitud de inscripción en el RIT',
      status: 'rejected',
      reviewedBy: reviewer,
      reviewDate: addDays(registrationDate, 8),
      observation: az.pick([
        'El certificado de existencia tiene más de 30 días.',
        'Falta la copia del RUT actualizada.',
      ]),
      replyDocuments: [
        randomFile(
          az,
          'Oficio de respuesta a la solicitud de inscripción',
          addDays(registrationDate, 8),
        ),
      ],
    })
  } else {
    ritChange({
      kind: 'registration',
      date: registrationDate,
      description: 'Solicitud de inscripción en el RIT',
      status: 'approved',
      reviewedBy: reviewer,
      reviewDate: addDays(registrationDate, 6),
    })
    if (az.prob(0.3)) {
      const date = randomDate(az, addDays(registrationDate, 90), '2026-01-31')
      const reasons = UPDATE_REASONS.filter((m) => !isNatural || !m.notForNaturalPersons)
      const reason = az.pick(reasons).reason
      // Las inscritas en 2026 no alcanzan a tener una actualización antes de febrero.
      if (!recentRegistration)
        ritChange({
          kind: 'update',
          date,
          description: reason,
          status: 'approved',
          reviewedBy: reviewer,
          reviewDate: addDays(date, 5),
        })
    }
    if (status === 'cancelled') {
      const date = randomDate(az, '2026-02-01', '2026-08-31')
      ritChange({
        kind: 'cancellation',
        date,
        description: 'Cese definitivo de actividades',
        status: 'approved',
        reviewedBy: reviewer,
        reviewDate: addDays(date, 10),
      })
    } else if (
      !isNatural &&
      !capacities.some((c) => c.capacity === 'withholding_agent') &&
      az.prob(0.12)
    ) {
      ritChange({
        kind: 'update',
        date: randomDate(az, '2026-09-01', DEMO_DATE),
        status: 'pending',
        capacity: 'withholding_agent',
        description: `Solicita agregar la calidad de agente retenedor (Resolución ${az.integer(100, 999)} de 2026)`,
      })
    } else if (az.prob(0.05)) {
      ritChange({
        kind: 'cancellation',
        date: randomDate(az, '2026-09-01', DEMO_DATE),
        description: 'Reporta cese definitivo de actividades',
        status: 'pending',
      })
    }
  }

  const supports = requiredSupports(
    personType,
    capacities.map((c) => c.capacity),
  ).map((name, i) => {
    const delivered = status !== 'under_review' || i === 0 || az.prob(0.75)
    return {
      name,
      delivered,
      file: delivered ? randomFile(az, name, startDate) : undefined,
    }
  })
  const document = isNatural
    ? String(az.integer(10_000_000, 1_199_999_999))
    : String(az.integer(900_100_000, 901_999_999))
  const name = subjectName(az, personType)

  const registration: Registration = {
    id,
    municipalityId,
    ritNumber: `${MUNICIPALITIES.find((m) => m.id === municipalityId)!.daneCode}-${String(n).padStart(5, '0')}`,
    personType,
    documentType: isNatural ? 'CC' : 'NIT',
    document,
    dv: isNatural ? undefined : String(az.integer(0, 9)),
    name,
    legalRepresentative: isNatural ? undefined : `${az.pick(FIRST_NAMES)} ${az.pick(LAST_NAMES)}`,
    address: randomAddress(az),
    phone: randomPhone(az),
    email: `contacto${n}@${isNatural ? 'correo' : 'empresa'}.demo`,
    ...accountingData(id, personType),
    activitiesStartDate: startDate,
    simpleRegime,
    activities,
    capacities,
    status,
    supports,
    ritChanges,
  }
  addForms(registration)
  return registration
}

// --- Declaraciones ---

/** Lo que se escribe en la declaración sobre quien la presenta: el contribuyente, el declarante y el contador o revisor fiscal. */
type FilledIn = Pick<Declaration, 'taxpayer' | 'filer' | 'accountant'>

/** Cédula de una persona de la demo: la misma para la misma clave. Usa su propio azar para no cambiar el resto de los datos. */
const idNumberOf = (key: string) =>
  String(createRandom(seed(key)).integer(10_000_000, 1_199_999_999))

/**
 * Lo que se escribe en la declaración: lo que el contribuyente tenía inscrito en el RIT el día que la presenta, así que
 * las declaraciones viejas conservan los datos de antes de una actualización. La persona natural se declara a sí misma;
 * por una empresa declara su representante legal. El número de establecimientos solo lo pide el formulario del ICA anual.
 */
function filledInBy(reg: Registration, date: string, tax: Tax): FilledIn {
  const inForce =
    reg.ritChanges.findLast(
      (n) => n.status === 'approved' && n.data && (n.reviewDate ?? n.date) <= date,
    )?.data ?? reg
  const {
    personType,
    documentType,
    document,
    dv,
    name,
    legalRepresentative,
    address,
    phone,
    email,
    accountant,
    establishments,
  } = inForce
  const filer: Signer = legalRepresentative
    ? {
        documentType: 'CC',
        document: idNumberOf(`${reg.id}-${legalRepresentative}`),
        name: legalRepresentative,
      }
    : { documentType: documentType === 'CE' ? 'CE' : 'CC', document, name }
  return {
    taxpayer: {
      personType,
      documentType,
      document,
      dv,
      name,
      address,
      phone,
      email,
      ...(tax === 'ica' && { establishments }),
    },
    filer,
    accountant,
  }
}

/**
 * Una sociedad que declara ReteICA sin estar inscrita en el RIT: lo que escribe en sus declaraciones. Su nombre no es
 * ninguno de los `usados`, para que no se confunda con un inscrito, y queda entre ellos.
 */
function unregisteredBy(
  az: Random,
  municipalityId: string,
  n: number,
  used: Set<string>,
): FilledIn {
  const document = String(az.integer(900_100_000, 901_999_999))
  const dv = String(az.integer(0, 9))
  let name = subjectName(az, 'legal')
  while (used.has(name)) name = subjectName(az, 'legal')
  used.add(name)
  const representative = `${az.pick(FIRST_NAMES)} ${az.pick(LAST_NAMES)}`
  return {
    taxpayer: {
      personType: 'legal',
      documentType: 'NIT',
      document,
      dv,
      name,
      address: randomAddress(az),
      phone: randomPhone(az),
      email: `tesoreria${n}@empresa.demo`,
    },
    filer: {
      documentType: 'CC',
      document: idNumberOf(`${municipalityId}-sin-rit-${n}-${representative}`),
      name: representative,
    },
    accountant: accountingData(`${municipalityId}-sin-rit-${n}`, 'legal').accountant,
  }
}

interface IcaProfile {
  income: number
  outsidePct: number
  refundsPct: number
  excludedPct: number
  notices: boolean
  withholdingsPct: number
  selfWithholdingsPct: number
}

/** Liquida el ICA anual. Con `emplazado`, la declaración llega después del emplazamiento para declarar (art. 642). */
function calculateIca(
  p: IcaProfile,
  reg: Registration,
  cfg: MunicipalityConfig,
  rates: Rate[],
  daysLate: number,
  discountPct: number,
  correctionPenalty = 0,
  summonedItem = false,
) {
  const rate = rates.find((t) => t.ciiu === reg.activities[0].ciiu)?.perThousand ?? 7
  const selfWithholder = reg.capacities.some((c) => c.capacity === 'self_withholder')
  const r8 = roundToThousand(p.income)
  const r9 = roundToThousand(r8 * p.outsidePct)
  const r10 = r8 - r9
  const r11 = roundToThousand(r10 * p.refundsPct)
  const r14 = roundToThousand(r10 * p.excludedPct)
  const r16 = r10 - r11 - r14
  const r20 = roundToThousand((r16 * rate) / 1000)
  const r21 = p.notices ? roundToThousand(r20 * 0.15) : 0
  const r23 = cfg.fireSurcharge.active
    ? roundToThousand((r20 * cfg.fireSurcharge.percentage) / 100)
    : 0
  const r25 = r20 + r21 + r23
  const r27 = selfWithholder ? 0 : roundToThousand(r20 * p.withholdingsPct)
  const r28 = selfWithholder ? roundToThousand(r20 * p.selfWithholdingsPct) : 0
  const r29 = roundToThousand((r20 * cfg.advancePercentage * 0.9) / 100)
  const r30 = roundToThousand((r20 * cfg.advancePercentage) / 100)
  const r31 = lateFilingPenalty(r25, daysLate, cfg.penalties, summonedItem) + correctionPenalty
  const balance = r25 - r27 - r28 - r29 + r30 + r31
  const r33 = Math.max(balance, 0)
  const r34 = Math.max(-balance, 0)
  const r35 = r33
  const r36 = daysLate === 0 ? Math.min(roundToThousand((r20 * discountPct) / 100), r35) : 0
  const r37 = daysLate > 0 ? roundToThousand(r33 * 0.00067 * daysLate) : 0
  const r38 = r35 - r36 + r37
  const lines: Line[] = [
    { code: '8', concept: 'Total ingresos ordinarios y extraordinarios del país', value: r8 },
    { code: '9', concept: 'Menos ingresos fuera del municipio', value: r9 },
    { code: '10', concept: 'Ingresos en este municipio', value: r10 },
    { code: '11', concept: 'Menos devoluciones, rebajas y descuentos', value: r11 },
    { code: '14', concept: 'Menos actividades excluidas o no sujetas', value: r14 },
    { code: '16', concept: 'Total ingresos gravables', value: r16 },
    { code: '17', concept: `Total impuesto (tarifa ${rate} por mil)`, value: r20 },
    { code: '20', concept: 'Total impuesto de industria y comercio', value: r20 },
    { code: '21', concept: 'Avisos y tableros', value: r21 },
    { code: '23', concept: 'Sobretasa bomberil', value: r23 },
    { code: '25', concept: 'Total impuesto a cargo', value: r25 },
    { code: '27', concept: 'Menos retenciones', value: r27 },
    { code: '28', concept: 'Menos autorretenciones', value: r28 },
    { code: '29', concept: 'Menos anticipo liquidado el año anterior', value: r29 },
    { code: '30', concept: 'Anticipo para el año siguiente', value: r30 },
    {
      code: '31',
      concept: correctionPenalty > 0 ? 'Sanciones (incluye sanción por corrección)' : 'Sanciones',
      value: r31,
    },
    { code: '33', concept: 'Total saldo a cargo', value: r33 },
    { code: '34', concept: 'Total saldo a favor', value: r34 },
    { code: '35', concept: 'Valor a pagar', value: r35 },
    {
      code: '36',
      concept:
        r36 > 0 ? `Descuento por pronto pago (${discountPct} %)` : 'Descuento por pronto pago',
      value: r36,
    },
    { code: '37', concept: 'Intereses de mora', value: r37 },
    { code: '38', concept: 'Total a pagar', value: r38 },
  ]
  return { lines, r33, r34, r38 }
}

/** Cuándo se presenta una retención o autorretención: a tiempo o, una de cada diez, con días de mora. */
function fileWithholding(az: Random, dueDateItem: string) {
  const daysLate = az.prob(0.1) ? az.integer(3, 60) : 0
  const filing =
    daysLate > 0 ? addDays(dueDateItem, daysLate) : addDays(dueDateItem, -az.integer(0, 15))
  return { daysLate, filing }
}

/**
 * Renglones 13 a 18 de la ReteICA de un periodo: lo retenido en cada concepto y lo que no se retuvo por estar debajo
 * de la base mínima, menos las devoluciones. Lo pagado crece con los meses del periodo. `azBases` sortea solo los
 * pagos por debajo de la base mínima.
 */
function calculateReteica(
  az: Random,
  randomBases: Random,
  cfg: MunicipalityConfig,
  rates: Rate[],
  frequency: Frequency,
) {
  const lines: Line[] = []
  const { minServiceBaseUvt: minServices, minPurchaseBaseUvt: minPurchases } = cfg.reteica
  // Con tarifa única va un solo renglón para servicios y compras, con la menor de las dos bases mínimas.
  const concepts =
    cfg.reteica.modality === 'flat'
      ? [
          {
            rate: cfg.reteica.flatRatePerThousand,
            paymentKind: 'servicios y compras',
            minimumUvt: Math.min(minServices, minPurchases),
          },
        ]
      : [
          {
            rate: rates.find((t) => t.sector === 'services')!.perThousand,
            paymentKind: 'servicios',
            minimumUvt: minServices,
          },
          {
            rate: rates.find((t) => t.sector === 'commercial')!.perThousand,
            paymentKind: 'compras',
            minimumUvt: minPurchases,
          },
        ]
  let withholdings = 0
  for (const { rate, paymentKind, minimumUvt } of concepts) {
    // La base es la suma de los pagos que llegan a la base mínima; los menores no se retienen. En un bimestre, de 15 a 900 millones.
    const base = az.integer(15, 900) * 500_000 * MONTHS_PER_PERIOD[frequency]
    const withholding = roundToThousand((base * rate) / 1000)
    withholdings += withholding
    const minimum = minimumUvt * UVT
    const smallerOnes = minimum > 0 ? randomBases.integer(0, 3) : 0
    const belowMinimum = Array.from({ length: smallerOnes }, () =>
      roundToThousand(minimum * (0.2 + randomBases.num() * 0.75)),
    ).reduce((a, b) => a + b, 0)
    lines.push({
      code: '13–15',
      concept:
        `Retención a ${rate} por mil sobre ${(base / 1_000_000).toLocaleString('es-CO')} millones en pagos de ${paymentKind}` +
        (smallerOnes > 0
          ? `. No se retienen ${smallerOnes} ${smallerOnes === 1 ? 'pago' : 'pagos'} por ${formatPesos(belowMinimum)}, por debajo de la base mínima de ${formatPesos(minimum)} (${minimumUvt} UVT)`
          : ''),
      value: withholding,
    })
  }
  const refunds = az.prob(0.15) ? roundToThousand(withholdings * az.num() * 0.1) : 0
  const tax = withholdings - refunds
  lines.push(
    { code: '16', concept: 'Retenciones practicadas en el periodo', value: withholdings },
    {
      code: '17',
      concept: 'Devoluciones, anulaciones y retenciones en exceso',
      value: refunds,
    },
    { code: '18', concept: 'Subtotal', value: tax },
  )
  return { lines, tax }
}

/**
 * Renglones 1 y 2 de la AutoReteICA de un periodo: la base, cerca de la parte de los ingresos del año que le toca al
 * periodo (un sexto en un bimestre), y lo autorretenido.
 */
function calculateSelfWithholding(
  az: Random,
  cfg: MunicipalityConfig,
  rates: Rate[],
  ciiu: string,
  income: number,
  frequency: Frequency,
) {
  const main = rates.find((t) => t.ciiu === ciiu)?.perThousand ?? 7
  const rate =
    cfg.selfWithholding.modality === 'full' ? main : (main * cfg.selfWithholding.percentage) / 100
  const base = roundToThousand(
    (income / (12 / MONTHS_PER_PERIOD[frequency])) * (0.8 + az.num() * 0.4),
  )
  const tax = roundToThousand((base * rate) / 1000)
  const lines: Line[] = [
    { code: '1', concept: `Base gravable del ${DURATION[frequency]}`, value: base },
    {
      code: '2',
      concept: `Autorretención a ${rate.toLocaleString('es-CO')} por mil`,
      value: tax,
    },
  ]
  return { lines, tax }
}

// --- Correcciones a la baja ---

/** Lo que hace falta para volver a liquidar un ICA 2025 inicial: así se generan al final sus correcciones a la baja. */
interface ToCorrect {
  reg: Registration
  profile: IcaProfile
  cfg: MunicipalityConfig
  rates: Rate[]
  discount: number
  daysLate: number
  pattern: 'total' | 'partial' | 'none'
}

/** Por qué corrige a la baja el contribuyente, el soporte que adjunta y qué cambia en su liquidación. */
const DOWNWARD_REASONS: {
  reason: string
  support: string
  adjust: (p: IcaProfile, x: number) => IcaProfile
}[] = [
  {
    reason: 'Incluí en este municipio ingresos de actividades que realicé en otro municipio.',
    support: 'Declaración de ICA presentada en el otro municipio',
    adjust: (p, x) => ({ ...p, outsidePct: p.outsidePct + x }),
  },
  {
    reason: 'Declaré como gravados ingresos de actividades excluidas o no sujetas.',
    support: 'Certificación de los ingresos excluidos',
    adjust: (p, x) => ({ ...p, excludedPct: p.excludedPct + x }),
  },
  {
    reason: 'No resté las devoluciones, rebajas y descuentos del año.',
    support: 'Relación de notas crédito del año',
    adjust: (p, x) => ({ ...p, refundsPct: p.refundsPct + x }),
  },
]

/**
 * Cada corrección a la baja de la demo. Las solicitudes (art. 589 anterior) van donde el municipio las usa: por resolver,
 * una de ellas con el plazo a punto de vencer, aceptada, aceptada por silencio y rechazada. Las directas, donde no: de una
 * declaración pagada, que deja un pago en exceso, y de una con pago parcial, que baja lo que falta por pagar.
 */
type CorrectionScenario =
  | 'to_resolve'
  | 'to_resolve_soon'
  | 'accepted'
  | 'silence'
  | 'rejected'
  | 'direct_paid'
  | 'direct_partial_payment'

const DOWNWARD_CORRECTIONS: Record<string, CorrectionScenario[]> = {
  m1: ['to_resolve_soon', 'to_resolve', 'accepted', 'silence'],
  m2: ['direct_paid', 'direct_partial_payment'],
  m3: ['to_resolve', 'rejected'],
}

interface CorrectionsSource {
  az: Random
  declarations: Declaration[]
  payments: Payment[]
  /** Las que la demo no corrige: las que tienen un cheque o se quitaron. */
  excluded: Set<string>
  toCorrect: Map<string, ToCorrect>
  number: () => string
  invoiceNumber: () => number
  today: string
}

/**
 * Agrega las correcciones a la baja del ICA 2025, todas dentro del año siguiente al vencimiento y sin sanción por
 * corrección. Corrigen declaraciones presentadas a tiempo, sin corrección y sin cheque. Las solicitudes corrigen
 * declaraciones pagadas por completo, porque lo pagado se acredita fijo al generar los datos, como en las correcciones de
 * mayor valor, y no debe cambiar mientras se resuelven. Las por resolver y la aceptada por silencio se radican según la
 * fecha de hoy, como las de la aprobación previa; las resueltas, dentro del rango de la bitácora.
 */
function addDownwardCorrections({
  az,
  declarations,
  payments,
  excluded,
  toCorrect,
  number,
  invoiceNumber,
  today,
}: CorrectionsSource) {
  const correctedOnes = new Set(declarations.map((d) => d.correctsId).filter(Boolean))
  const paidAmount = (id: string) =>
    payments.filter((p) => p.declarationId === id).reduce((s, p) => s + p.value, 0)
  const official = (municipalityId: string) =>
    fullName(USERS.find((u) => u.municipalityId === municipalityId && u.role === 'official')!)

  for (const [municipalityId, scenarios] of Object.entries(DOWNWARD_CORRECTIONS)) {
    const withApplication =
      SETTINGS.find((c) => c.municipalityId === municipalityId)!.downwardCorrection ===
      'project_589'
    for (const scenario of scenarios) {
      if (scenario.startsWith('direct') === withApplication) continue
      const date =
        scenario === 'to_resolve_soon'
          ? addDays(addMonths(today, -6), az.integer(8, 12))
          : scenario === 'to_resolve'
            ? addDays(today, -az.integer(20, 60))
            : scenario === 'silence'
              ? randomDate(az, '2026-04-20', '2026-04-28')
              : scenario === 'accepted'
                ? randomDate(az, '2026-06-01', '2026-06-30')
                : scenario === 'rejected'
                  ? randomDate(az, '2026-06-15', '2026-07-15')
                  : randomDate(az, '2026-07-01', '2026-10-15')
      const partial = scenario === 'direct_partial_payment'
      const candidates = declarations.filter((d) => {
        const x = toCorrect.get(d.id)
        return (
          x !== undefined &&
          d.municipalityId === municipalityId &&
          x.daysLate === 0 &&
          !correctedOnes.has(d.id) &&
          !excluded.has(d.id) &&
          calculatedValue(d) > 0 &&
          d.creditBalance === 0 &&
          x.pattern === (partial ? 'partial' : 'total') &&
          (partial || paidAmount(d.id) >= d.totalToPay) &&
          d.dueDate < date &&
          date <= downwardCorrectionLimit(d.dueDate)
        )
      })
      if (candidates.length === 0) continue
      const original = az.pick(candidates)
      correctedOnes.add(original.id)
      const x = toCorrect.get(original.id)!
      const m = az.pick(DOWNWARD_REASONS)
      const newItem = calculateIca(
        m.adjust(x.profile, 0.08 + az.num() * 0.12),
        x.reg,
        x.cfg,
        x.rates,
        0,
        x.discount,
      )
      const alreadyPaidAmount = paidAmount(original.id)
      // Con el pago parcial, la corrección deja algo por pagar: baja la deuda sin que sobre.
      if (newItem.r38 >= calculatedValue(original) || (partial && newItem.r38 <= alreadyPaidAmount))
        continue
      const reason = m.reason
      const correctionApplication: CorrectionApplication | undefined =
        scenario === 'accepted'
          ? {
              status: 'accepted',
              reason,
              date: randomDate(az, '2026-09-01', '2026-09-30'),
              by: official(municipalityId),
              observation: 'Se revisó el soporte que adjuntó: la corrección procede.',
            }
          : scenario === 'rejected'
            ? {
                status: 'rejected',
                reason,
                date: randomDate(az, '2026-10-01', '2026-10-20'),
                by: official(municipalityId),
                observation: 'No adjuntó soportes que demuestren el menor valor que pide',
              }
            : withApplication
              ? { status: 'pending', reason }
              : undefined
      declarations.push({
        // La rechazada no trae el soporte: por eso se rechaza.
        attachments:
          scenario === 'rejected'
            ? []
            : [{ name: m.support, file: randomFile(az, m.support, date) }],
        ...filledInBy(x.reg, date, 'ica'),
        id: `d${declarations.length + 1}`,
        municipalityId,
        registrationId: x.reg.id,
        tax: 'ica',
        fiscalYear: 2025,
        frequency: 'annual',
        period: 1,
        kind: 'correction',
        correctsId: original.id,
        number: number(),
        invoiceNumber: invoiceNumber(),
        filingDate: date,
        dueDate: original.dueDate,
        lines:
          alreadyPaidAmount > 0
            ? [
                ...newItem.lines,
                {
                  code: PAID_WITH_CORRECTED_CODE,
                  concept: 'Menos lo pagado con la declaración que se corrige',
                  value: alreadyPaidAmount,
                },
              ]
            : newItem.lines,
        totalToPay: Math.max(newItem.r38 - alreadyPaidAmount, 0),
        creditBalance: newItem.r34,
        ...(correctionApplication && { correctionApplication }),
      })
    }
  }
}

// --- Emplazamientos ---

interface SummonsesSource {
  az: Random
  declarations: Declaration[]
  registrations: Registration[]
  payments: Payment[]
  /** Las retenciones que se quitaron para que haya omisos. */
  omitted: Set<string>
  /** Las que la demo no emplaza para corregir: las que tienen un cheque o se quitaron. */
  excluded: Set<string>
  /** Los ICA 2025 omisos, con lo que hace falta para liquidar su declaración si responden. */
  icaNonFilers: { reg: Registration; profile: IcaProfile; cfg: MunicipalityConfig; rates: Rate[] }[]
  toCorrect: Map<string, ToCorrect>
  number: () => string
  invoiceNumber: () => number
  addPayment: (declarationId: string, date: string, value: number, random: Random) => void
  today: string
}

/**
 * Los emplazamientos de la demo, en cada estado:
 * - Villeta emplaza en un lote del 18 de agosto de 2026 a sus dos omisos del ICA 2025: uno declara dentro del
 *   mes, con la extemporaneidad del art. 642, y el otro deja vencer el plazo. Además emplaza para corregir un ICA 2025
 *   pagado, que se corrige con la sanción de corrección tras emplazamiento.
 * - Ricaurte emplaza a dos agentes de ReteICA omisos hace unos días hábiles (siguen en plazo) y para corregir a
 *   un contribuyente que no responde.
 * - Garzón, sin RIT ni omisos, emplaza para corregir hace unos días.
 * Los de fecha fija caen en el rango de la bitácora; los demás se cuentan desde hoy, como la aprobación previa.
 */
function addSummonses(f: SummonsesSource): Summons[] {
  const { az, declarations, payments, excluded, toCorrect, today } = f
  const summonses: Summons[] = []
  const who = (id: string) => fullName(USERS.find((u) => u.id === id)!)
  const summon = (
    destination: SummonsDestination,
    number: string,
    notificationDate: string,
    recordedBy: string,
    recordDate: string,
    withCopy = false,
  ) => {
    const copy = withCopy ? randomFile(az, `Emplazamiento ${number}`, recordDate) : undefined
    summonses.push({
      ...destination,
      id: `em${summonses.length + 1}`,
      number,
      notificationDate,
      recordedBy,
      recordDate,
      ...(copy && { copy }),
    })
  }
  const toFile = (o: NonFiler): SummonsDestination => ({
    kind: 'file',
    municipalityId: o.registration.municipalityId,
    registrationId: o.registration.id,
    tax: o.tax,
    fiscalYear: o.fiscalYear,
    frequency: o.frequency,
    period: o.period,
  })
  const paidAmount = (id: string) =>
    payments.filter((p) => p.declarationId === id).reduce((s, p) => s + p.value, 0)
  const correctedOnes = new Set(declarations.map((d) => d.correctsId).filter(Boolean))
  // Para corregir: un ICA 2025 a tiempo, pagado por completo, sin corrección ni cheque, presentado antes de la notificación.
  const toSummon = (municipalityId: string, notification: string) => {
    const candidates = declarations.filter((d) => {
      const x = toCorrect.get(d.id)
      return (
        x !== undefined &&
        d.municipalityId === municipalityId &&
        x.daysLate === 0 &&
        x.pattern === 'total' &&
        !correctedOnes.has(d.id) &&
        !excluded.has(d.id) &&
        calculatedValue(d) > 0 &&
        d.creditBalance === 0 &&
        paidAmount(d.id) >= d.totalToPay &&
        d.filingDate < notification
      )
    })
    if (candidates.length === 0) return undefined
    const picked = az.pick(candidates)
    correctedOnes.add(picked.id)
    return picked
  }

  const { nonFilers } = computeNonFilers(
    {
      municipalities: MUNICIPALITIES,
      settingsList: SETTINGS,
      registrations: f.registrations,
      declarations: declarations.filter((d) => !f.omitted.has(d.id)),
    },
    null,
    today,
  )

  // Villeta: el lote de los omisos del ICA 2025. Declara el que tiene con qué liquidar su ICA.
  const BATCH = '2026-08-18'
  const icaM1 = nonFilers.filter(
    (o) =>
      o.registration.municipalityId === 'm1' &&
      o.tax === 'ica' &&
      o.fiscalYear === 2025 &&
      o.dueDateItem < BATCH,
  )
  const mustFile = icaM1.find((o) => f.icaNonFilers.some((x) => x.reg.id === o.registration.id))
  const leaves = icaM1.find((o) => o !== mustFile)
  if (mustFile) summon(toFile(mustFile), 'EPD-2026-014', BATCH, who('u3'), '2026-08-19', true)
  if (leaves) summon(toFile(leaves), 'EPD-2026-015', BATCH, who('u3'), '2026-08-19')
  if (mustFile) {
    const x = f.icaNonFilers.find((y) => y.reg.id === mustFile.registration.id)!
    const filing = '2026-09-08'
    const calc = calculateIca(
      x.profile,
      x.reg,
      x.cfg,
      x.rates,
      dayDifference(mustFile.dueDateItem, filing),
      0,
      0,
      true,
    )
    const id = `d${declarations.length + 1}`
    declarations.push({
      attachments: [],
      ...filledInBy(x.reg, filing, 'ica'),
      id,
      municipalityId: 'm1',
      registrationId: x.reg.id,
      tax: 'ica',
      fiscalYear: 2025,
      frequency: 'annual',
      period: 1,
      kind: 'initial',
      number: f.number(),
      invoiceNumber: f.invoiceNumber(),
      filingDate: filing,
      dueDate: mustFile.dueDateItem,
      lines: calc.lines,
      totalToPay: calc.r38,
      creditBalance: calc.r34,
    })
    f.addPayment(id, filing, calc.r38, az)
  }

  // Villeta: para corregir, y la corrección con la sanción de corrección tras emplazamiento.
  const original = toSummon('m1', '2026-09-01')
  if (original) {
    summon(
      { kind: 'correct', municipalityId: 'm1', declarationId: original.id },
      'EPC-2026-007',
      '2026-09-01',
      who('u3'),
      '2026-09-02',
      true,
    )
    const x = toCorrect.get(original.id)!
    const correctedItem = { ...x.profile, income: x.profile.income * (1.06 + az.num() * 0.08) }
    const base = calculateIca(correctedItem, x.reg, x.cfg, x.rates, 0, 0)
    const r33 = original.lines.find((r) => r.code === '33')?.value ?? 0
    const highestValue = Math.max(base.r33 - r33, 0)
    const penalty = Math.max(
      roundToThousand((highestValue * x.cfg.penalties.summonsCorrection) / 100),
      roundToThousand(x.cfg.penalties.minimumUvt * UVT),
    )
    const newItem = calculateIca(correctedItem, x.reg, x.cfg, x.rates, 0, 0, penalty)
    const alreadyPaidAmount = paidAmount(original.id)
    const date = '2026-09-22'
    const id = `d${declarations.length + 1}`
    declarations.push({
      attachments: [],
      ...filledInBy(x.reg, date, 'ica'),
      id,
      municipalityId: 'm1',
      registrationId: x.reg.id,
      tax: 'ica',
      fiscalYear: 2025,
      frequency: 'annual',
      period: 1,
      kind: 'correction',
      correctsId: original.id,
      number: f.number(),
      invoiceNumber: f.invoiceNumber(),
      filingDate: date,
      dueDate: original.dueDate,
      lines: [
        ...newItem.lines,
        {
          code: PAID_WITH_CORRECTED_CODE,
          concept: 'Menos lo pagado con la declaración que se corrige',
          value: alreadyPaidAmount,
        },
      ],
      totalToPay: Math.max(newItem.r38 - alreadyPaidAmount, 0),
      creditBalance: newItem.r34,
    })
    f.addPayment(id, date, Math.max(newItem.r38 - alreadyPaidAmount, 0), az)
  }

  // Ricaurte: para corregir sin respuesta, y dos agentes de ReteICA omisos, distintos, emplazados hace unos días.
  const withoutReply = toSummon('m2', '2026-09-10')
  if (withoutReply)
    summon(
      { kind: 'correct', municipalityId: 'm2', declarationId: withoutReply.id },
      'EPC-2026-031',
      '2026-09-10',
      who('u6'),
      '2026-09-11',
    )
  const recent = addBusinessDays(today, -3)
  const agents = nonFilers
    .filter(
      (o) =>
        o.registration.municipalityId === 'm2' &&
        o.tax === 'reteica' &&
        o.registration.status === 'active' &&
        o.dueDateItem < recent,
    )
    .filter((o, i, list) => list.findIndex((y) => y.registration.id === o.registration.id) === i)
    .slice(0, 2)
  agents.forEach((o, i) =>
    summon(toFile(o), `EPD-2026-${102 + i}`, recent, who('u6'), recent, i === 0),
  )

  // Garzón: para corregir, en plazo.
  const onTime = toSummon('m3', addBusinessDays(today, -4))
  if (onTime)
    summon(
      { kind: 'correct', municipalityId: 'm3', declarationId: onTime.id },
      'EPC-2026-005',
      addBusinessDays(today, -4),
      who('u8'),
      addBusinessDays(today, -4),
      true,
    )

  return summonses
}

/**
 * Agrega a los renglones de una retención o autorretención la sanción, los intereses y el total, que devuelve. Con
 * `emplazado`, la declaración llega después del emplazamiento para declarar (art. 642).
 */
function closeWithholding(
  lines: Line[],
  tax: number,
  daysLate: number,
  cfg: MunicipalityConfig,
  summonedItem = false,
) {
  const penalty = lateFilingPenalty(tax, daysLate, cfg.penalties, summonedItem)
  const interest = daysLate > 0 ? roundToThousand(tax * 0.00067 * daysLate) : 0
  const total = tax + penalty + interest
  lines.push(
    { code: 'S', concept: 'Sanción por extemporaneidad', value: penalty },
    { code: 'I', concept: 'Intereses de mora', value: interest },
    { code: 'T', concept: 'Total a pagar', value: total },
  )
  return total
}

export function generateData(): Data {
  const az = createRandom(20261022)
  // Los pagos por debajo de la base mínima de ReteICA tienen su propio azar para no cambiar el resto de los datos.
  const randomBases = createRandom(1529)
  const registrations: Registration[] = []
  const declarations: Declaration[] = []
  const payments: Payment[] = []
  /** Contribuyentes que no declararon el ICA 2025 en plazo. */
  const nonFilers: {
    municipality: Municipality
    reg: Registration
    profile: IcaProfile
    cfg: MunicipalityConfig
    rates: Rate[]
  }[] = []
  /** Los ICA 2025 iniciales, para volver a liquidarlos en sus correcciones a la baja. Guardarlos no usa el azar. */
  const toCorrect = new Map<string, ToCorrect>()
  let sequence = 1
  randomRecent = createRandom(2026)
  recentRegistrations = 0
  /** Cuántas declaraciones se han presentado tarde a propósito: cada una cae en el mes siguiente, hasta octubre. */
  let lateFilings = 0

  // Con `registrar` en falso sortea el medio igual, pero no deja el pago: así no cambia el resto de los datos.
  const addPayment = (
    declarationId: string,
    date: string,
    value: number,
    random = az,
    record = true,
  ) => {
    if (value <= 0) return
    const method = random.pick(['PSE', 'Banco de Bogotá', 'Bancolombia', 'Davivienda'])
    if (record) payments.push({ id: `p${payments.length + 1}`, declarationId, date, value, method })
  }
  // Si a la fecha de la demo aún no vence el plazo de 2 meses para consignar, algunas retenciones que se pagarían siguen
  // sin pagar, para que la demo siempre tenga retenciones en plazo. Lo decide su propio azar.
  const randomTerm = createRandom(5801)
  const alreadyPaid = (dueDateItem: string) =>
    remittanceLimit(dueDateItem) <= DEMO_DATE || randomTerm.prob(0.7)
  const number = (prefix: string, fiscalYear: number) =>
    `${prefix}-${fiscalYear}-${String(sequence++).padStart(6, '0')}`
  // La factura lleva su propio consecutivo y no usa el azar, para no cambiar el resto de los datos.
  let invoice = 4_810_200_000
  const invoiceNumber = () => ++invoice

  for (const municipality of MUNICIPALITIES) {
    const cfg = SETTINGS.find((c) => c.municipalityId === municipality.id)!
    const ratesOf = (fiscalYear: number) =>
      ACTIVITIES_BY_FISCAL_YEAR.find(
        (a) => a.municipalityId === municipality.id && a.fiscalYear === fiscalYear,
      )!.rates
    const rates2025 = ratesOf(2025)
    const rates2026 = ratesOf(2026)
    for (let n = 1; n <= REGISTRATIONS_BY_MUNICIPALITY; n++) {
      const reg = generateRegistration(az, municipality.id, n)
      registrations.push(reg)
      const isNatural = reg.personType === 'natural'
      const profile: IcaProfile = {
        income: (isNatural ? az.integer(60, 900) : az.integer(400, 18_000)) * 1_000_000,
        outsidePct: az.prob(0.3) ? az.num() * 0.3 : 0,
        refundsPct: az.num() * 0.03,
        excludedPct: az.prob(0.2) ? az.num() * 0.1 : 0,
        notices: az.prob(0.6),
        withholdingsPct: az.num() * 0.2,
        // Hasta 120% del impuesto: algunos autorretenedores terminan con saldo a favor.
        selfWithholdingsPct: 0.75 + az.num() * 0.45,
      }
      const canFileIca = reg.capacities.some((c) => c.capacity === 'taxpayer') && !reg.simpleRegime

      // ICA anual, año gravable 2025.
      if (reg.status === 'active' && canFileIca && az.prob(0.9)) {
        const dueDateItem = icaDueDate(cfg, 2025, reg.document)
        const drawnLate = az.prob(0.12) ? az.integer(5, 120) : 0
        const drawnEarly = drawnLate > 0 ? 0 : az.integer(1, 60)
        // Con su propio azar se reparten más: unas desde enero y otras tarde, hasta la fecha de la demo, para que
        // haya declaraciones todos los meses.
        const spread = randomRecent.num()
        const dueMonth = Number(dueDateItem.slice(5, 7))
        const lateMonths = 10 - dueMonth
        const lateDate =
          spread < 0.25 && dueDateItem.startsWith('2026') && lateMonths > 0
            ? smaller(
                inMonth(
                  2026,
                  dueMonth + 1 + (lateFilings++ % lateMonths),
                  randomRecent.integer(1, 28),
                ),
                DEMO_DATE,
              )
            : undefined
        const daysLate = lateDate
          ? dayDifference(dueDateItem, lateDate)
          : Math.min(drawnLate, dayDifference(dueDateItem, DEMO_DATE))
        const early = addDays(
          dueDateItem,
          -(spread > 0.7 ? randomRecent.integer(61, 120) : drawnEarly),
        )
        const filing =
          daysLate > 0
            ? addDays(dueDateItem, daysLate)
            : early < '2026-01-02'
              ? '2026-01-02'
              : early
        const pattern = az.prob(0.8) ? 'total' : az.prob(0.6) ? 'partial' : 'none'
        // Solo conserva el descuento quien paga todo y está a paz y salvo; el porcentaje sale del tramo de la fecha de pago.
        const discount =
          pattern === 'total' && az.prob(0.6) ? earlyPaymentPercentage(cfg, 2025, filing) : 0
        const calc = calculateIca(profile, reg, cfg, rates2025, daysLate, discount)
        reviewDraw(az, 0.3)
        const id = `d${declarations.length + 1}`
        declarations.push({
          attachments: [],
          ...filledInBy(reg, filing, 'ica'),
          id,
          municipalityId: municipality.id,
          registrationId: reg.id,
          tax: 'ica',
          fiscalYear: 2025,
          frequency: 'annual',
          period: 1,
          kind: 'initial',
          number: number('ICA', 2025),
          invoiceNumber: invoiceNumber(),
          filingDate: filing,
          dueDate: dueDateItem,
          lines: calc.lines,
          totalToPay: calc.r38,
          creditBalance: calc.r34,
        })
        toCorrect.set(id, {
          reg,
          profile,
          cfg,
          rates: rates2025,
          discount,
          daysLate,
          pattern,
        })
        if (pattern === 'total') addPayment(id, filing, calc.r38)
        if (pattern === 'partial')
          addPayment(id, filing, roundToThousand(calc.r38 * (0.4 + az.num() * 0.3)))

        // Corrección de mayor valor: hereda como crédito lo ya pagado.
        if (pattern === 'total' && calc.r38 > 0 && az.prob(0.1)) {
          const correctedItem = { ...profile, income: profile.income * (1.05 + az.num() * 0.1) }
          const base = calculateIca(correctedItem, reg, cfg, rates2025, daysLate, 0)
          const highestValue = Math.max(base.r33 - calc.r33, 0)
          const penalty = Math.max(
            roundToThousand((highestValue * cfg.penalties.correction) / 100),
            roundToThousand(cfg.penalties.minimumUvt * UVT),
          )
          const newItem = calculateIca(correctedItem, reg, cfg, rates2025, daysLate, 0, penalty)
          const paidAmount = calc.r38
          const toPay = Math.max(newItem.r38 - paidAmount, 0)
          const date = smaller(addDays(filing, az.integer(30, 150)), DEMO_DATE)
          const correctionId = `d${declarations.length + 1}`
          declarations.push({
            attachments: [],
            ...filledInBy(reg, date, 'ica'),
            id: correctionId,
            municipalityId: municipality.id,
            registrationId: reg.id,
            tax: 'ica',
            fiscalYear: 2025,
            frequency: 'annual',
            period: 1,
            kind: 'correction',
            correctsId: id,
            number: number('ICA', 2025),
            invoiceNumber: invoiceNumber(),
            filingDate: date,
            dueDate: dueDateItem,
            lines: [
              ...newItem.lines,
              {
                code: PAID_WITH_CORRECTED_CODE,
                concept: 'Menos lo pagado con la declaración que se corrige',
                value: paidAmount,
              },
            ],
            totalToPay: toPay,
            creditBalance: newItem.r34,
          })
          addPayment(correctionId, date, toPay)
        }
      } else if (reg.status === 'active' && canFileIca) {
        nonFilers.push({ municipality, reg, profile, cfg, rates: rates2025 })
      }

      // Clausura: quien canceló su RIT presenta la fracción de año.
      if (reg.status === 'cancelled' && canFileIca) {
        const closing = reg.ritChanges.find((nv) => nv.kind === 'cancellation')!.date
        const fraction = { ...profile, income: profile.income * (0.3 + az.num() * 0.4) }
        const calc = calculateIca(fraction, reg, { ...cfg, advancePercentage: 0 }, rates2026, 0, 0)
        const filing = addDays(closing, az.integer(5, 25))
        const id = `d${declarations.length + 1}`
        declarations.push({
          attachments: [],
          ...filledInBy(reg, filing, 'ica'),
          id,
          municipalityId: municipality.id,
          registrationId: reg.id,
          tax: 'ica',
          fiscalYear: 2026,
          frequency: 'annual',
          period: 1,
          kind: 'closure',
          closingDate: closing,
          number: number('ICA', 2026),
          invoiceNumber: invoiceNumber(),
          filingDate: filing,
          dueDate: addDays(closing, 60),
          lines: calc.lines,
          totalToPay: calc.r38,
          creditBalance: calc.r34,
        })
        addPayment(id, filing, calc.r38)
      }

      if (reg.status !== 'active') continue

      // Retención (ReteICA) y autorretención de 2026: los periodos del calendario de cada formulario que ya vencieron a la
      // fecha de la demo. Los dos formularios se recorren a la par, periodo a periodo.
      const forms = (['reteica', 'selfWithholding'] as const)
        .filter((tax) => reg.capacities.some((c) => c.capacity === WITHHOLDING_CAPACITY[tax]))
        .map((tax) => ({
          tax,
          periods: overduePeriods(cfg, tax, 2026, reg.document),
        }))
      for (let i = 0; i < Math.max(0, ...forms.map((f) => f.periods.length)); i++) {
        for (const { tax, periods } of forms) {
          const p = periods[i]
          if (!p) continue
          const { daysLate, filing } = fileWithholding(az, p.dueDateItem)
          // Si la presentaría después de la fecha de la demo, todavía no la ha presentado.
          if (filing > DEMO_DATE) continue
          const isWithholding = tax === 'reteica'
          const calculation = isWithholding
            ? calculateReteica(az, randomBases, cfg, rates2026, p.frequency)
            : calculateSelfWithholding(
                az,
                cfg,
                rates2026,
                reg.activities[0].ciiu,
                profile.income,
                p.frequency,
              )
          const total = closeWithholding(calculation.lines, calculation.tax, daysLate, cfg)
          // El último periodo vencido sortea distinto, como el bimestre 4 cuando la demo solo tenía bimestres.
          reviewDraw(az, i === periods.length - 1 ? 0.7 : 0.1)
          const id = `d${declarations.length + 1}`
          declarations.push({
            attachments: [],
            ...filledInBy(reg, filing, tax),
            id,
            municipalityId: municipality.id,
            registrationId: reg.id,
            tax,
            fiscalYear: 2026,
            frequency: p.frequency,
            period: p.period,
            kind: 'initial',
            number: number(isWithholding ? 'RET' : 'AUT', 2026),
            invoiceNumber: invoiceNumber(),
            filingDate: filing,
            dueDate: p.dueDateItem,
            lines: calculation.lines,
            totalToPay: total,
            creditBalance: 0,
          })
          if (az.prob(isWithholding ? 0.9 : 0.95))
            addPayment(id, filing, total, az, alreadyPaid(p.dueDateItem))
        }
      }
    }
  }

  // Algunos municipios piden anexos con la declaración; no todos los contribuyentes los cargan.
  for (const d of declarations) {
    d.attachments = ANNEXES[d.tax]
      .filter(() => az.prob(d.tax === 'ica' ? 0.45 : 0.6))
      .map((name) => ({ name, file: randomFile(az, name, d.filingDate) }))
  }

  // Aprobación previa: los omisos del ICA 2025 se ponen al día en los últimos días hábiles antes de
  // generar los datos, para que la demo siempre tenga declaraciones por aprobar en plazo y vencidas.
  // Tienen su propio azar para no cambiar el resto de los datos, y aún no tienen pagos.
  const randomApproval = createRandom(4056)
  const today = new Date().toISOString().slice(0, 10)
  for (const { municipality, reg, profile, cfg, rates } of nonFilers) {
    if (!municipality.priorApproval.ica) continue
    const dueDateItem = icaDueDate(cfg, 2025, reg.document)
    const filing = addBusinessDays(today, -randomApproval.integer(0, 9))
    const daysLate = Math.max(
      Math.round((Date.parse(filing) - Date.parse(dueDateItem)) / 86400000),
      0,
    )
    const calc = calculateIca(profile, reg, cfg, rates, daysLate, 0)
    declarations.push({
      attachments: ANNEXES.ica
        .filter(() => randomApproval.prob(0.45))
        .map((name) => ({
          name,
          file: randomFile(randomApproval, name, filing),
        })),
      ...filledInBy(reg, filing, 'ica'),
      id: `d${declarations.length + 1}`,
      municipalityId: municipality.id,
      registrationId: reg.id,
      tax: 'ica',
      fiscalYear: 2025,
      frequency: 'annual',
      period: 1,
      kind: 'initial',
      number: number('ICA', 2025),
      invoiceNumber: invoiceNumber(),
      filingDate: filing,
      dueDate: dueDateItem,
      lines: calc.lines,
      totalToPay: calc.r38,
      creditBalance: calc.r34,
      approval: { status: 'pending' },
    })
  }

  // Agentes de ReteICA que no están inscritos en el RIT: declaran donde el municipio tiene el RIT, pero no valida la
  // ReteICA contra el RIT. Tienen su propio azar para no cambiar el resto de los datos.
  const randomUnregistered = createRandom(402)
  const usedNames = new Set(registrations.map((i) => i.name))
  for (const municipality of MUNICIPALITIES.filter(
    (m) => m.rit && m.taxes.reteica && !m.validateAgainstRit.reteica,
  )) {
    const cfg = SETTINGS.find((c) => c.municipalityId === municipality.id)!
    const rates = ACTIVITIES_BY_FISCAL_YEAR.find(
      (a) => a.municipalityId === municipality.id && a.fiscalYear === 2026,
    )!.rates
    for (let n = 1; n <= UNREGISTERED_AGENTS; n++) {
      const filledIn = unregisteredBy(randomUnregistered, municipality.id, n, usedNames)
      for (const p of overduePeriods(cfg, 'reteica', 2026, filledIn.taxpayer.document)) {
        const { daysLate, filing } = fileWithholding(randomUnregistered, p.dueDateItem)
        if (filing > DEMO_DATE) continue
        const { lines, tax } = calculateReteica(
          randomUnregistered,
          randomUnregistered,
          cfg,
          rates,
          p.frequency,
        )
        const total = closeWithholding(lines, tax, daysLate, cfg)
        const id = `d${declarations.length + 1}`
        declarations.push({
          attachments: ANNEXES.reteica
            .filter(() => randomUnregistered.prob(0.6))
            .map((name) => ({
              name,
              file: randomFile(randomUnregistered, name, filing),
            })),
          ...structuredClone(filledIn),
          id,
          municipalityId: municipality.id,
          tax: 'reteica',
          fiscalYear: 2026,
          frequency: p.frequency,
          period: p.period,
          kind: 'initial',
          number: number('RET', 2026),
          invoiceNumber: invoiceNumber(),
          filingDate: filing,
          dueDate: p.dueDateItem,
          lines,
          totalToPay: total,
          creditBalance: 0,
        })
        if (randomUnregistered.prob(0.9))
          addPayment(id, filing, total, randomUnregistered, alreadyPaid(p.dueDateItem))
      }
    }
  }

  const checks = generateChecks(declarations, payments)
  const collectionHistory = generateHistory(az, declarations, payments)

  // Omisos de retención: algunos agentes y autorretenedores no declararon un periodo, salvo el primero. Se quitan al final
  // y con su propio azar para no cambiar el resto de los datos; no se tocan las declaraciones que tienen un cheque.
  const randomNonFilers = createRandom(580)
  const withCheck = new Set(checks.map((c) => c.declarationId))
  const omitted = new Set(
    declarations
      .filter(
        (d) =>
          d.tax !== 'ica' && d.period >= 2 && !withCheck.has(d.id) && randomNonFilers.prob(0.12),
      )
      .map((d) => d.id),
  )

  // Correcciones a la baja del ICA 2025: al final y con su propio azar, para no cambiar el resto de los datos.
  addDownwardCorrections({
    az: createRandom(589),
    declarations,
    payments,
    excluded: new Set([...withCheck, ...omitted]),
    toCorrect,
    number: () => number('ICA', 2025),
    invoiceNumber,
    today,
  })

  // Emplazamientos: al final y con su propio azar, para no cambiar el resto de los datos.
  const summonses = addSummonses({
    az: createRandom(715),
    declarations,
    registrations,
    payments,
    omitted,
    excluded: new Set([...withCheck, ...omitted]),
    icaNonFilers: nonFilers,
    toCorrect,
    number: () => number('ICA', 2025),
    invoiceNumber,
    addPayment,
    today,
  })

  // Historia: el ICA anual de los años gravables 2016 a 2024, presentado y pagado, de quienes ya tenían actividad ese
  // año. Vence el mismo día que el de 2025 y usa sus tarifas. Al final y con su propio azar, para no cambiar el resto.
  const randomPast = createRandom(2016)
  for (const reg of registrations) {
    const municipality = MUNICIPALITIES.find((m) => m.id === reg.municipalityId)!
    const isTaxpayer = reg.capacities.some((c) => c.capacity === 'taxpayer')
    if (!municipality.taxes.ica || reg.status === 'under_review' || !isTaxpayer || reg.simpleRegime)
      continue
    const cfg = SETTINGS.find((c) => c.municipalityId === municipality.id)!
    const rates = ACTIVITIES_BY_FISCAL_YEAR.find(
      (a) => a.municipalityId === municipality.id && a.fiscalYear === 2025,
    )!.rates
    const isNatural = reg.personType === 'natural'
    const income2025 =
      (isNatural ? randomPast.integer(60, 900) : randomPast.integer(400, 18_000)) * 1_000_000
    for (let fiscalYear = 2016; fiscalYear <= 2024; fiscalYear++) {
      if (reg.activitiesStartDate > `${fiscalYear}-12-31` || randomPast.prob(0.08)) continue
      const profile: IcaProfile = {
        // Los ingresos crecen cerca de un 6 % al año hasta 2025.
        income: income2025 * 0.94 ** (2025 - fiscalYear) * (0.9 + randomPast.num() * 0.2),
        outsidePct: randomPast.prob(0.3) ? randomPast.num() * 0.3 : 0,
        refundsPct: randomPast.num() * 0.03,
        excludedPct: randomPast.prob(0.2) ? randomPast.num() * 0.1 : 0,
        notices: randomPast.prob(0.6),
        withholdingsPct: randomPast.num() * 0.2,
        selfWithholdingsPct: 0.75 + randomPast.num() * 0.3,
      }
      const dueDateItem = `${fiscalYear + 1}${icaDueDate(cfg, 2025, reg.document).slice(4)}`
      const daysLate = randomPast.prob(0.1) ? randomPast.integer(5, 90) : 0
      const filing = addDays(dueDateItem, daysLate > 0 ? daysLate : -randomPast.integer(1, 60))
      const calc = calculateIca(profile, reg, cfg, rates, daysLate, 0)
      const id = `d${declarations.length + 1}`
      declarations.push({
        attachments: [],
        ...filledInBy(reg, filing, 'ica'),
        id,
        municipalityId: municipality.id,
        registrationId: reg.id,
        tax: 'ica',
        fiscalYear,
        frequency: 'annual',
        period: 1,
        kind: 'initial',
        number: number('ICA', fiscalYear),
        invoiceNumber: invoiceNumber(),
        filingDate: filing,
        dueDate: dueDateItem,
        lines: calc.lines,
        totalToPay: calc.r38,
        creditBalance: calc.r34,
      })
      addPayment(id, filing, calc.r38, randomPast)
    }
  }

  // Donde el municipio no tiene el RIT en el aplicativo no hay inscripciones: de sus contribuyentes solo se sabe lo que
  // escriben en las declaraciones. Se generan igual y aquí se quitan, para no cambiar el resto de los datos.
  const withRit = new Set(MUNICIPALITIES.filter((m) => m.rit).map((m) => m.id))
  for (const d of declarations) if (!withRit.has(d.municipalityId)) delete d.registrationId

  const data = {
    municipalities: MUNICIPALITIES.map((m) => ({ ...m })),
    users: USERS.map((u) => ({ ...u })),
    registrations: registrations.filter((i) => withRit.has(i.municipalityId)),
    declarations: declarations.filter((d) => !omitted.has(d.id)),
    payments: payments.filter((p) => !omitted.has(p.declarationId)),
    checks,
    collectionHistory,
    settingsList: structuredClone(SETTINGS),
    activities: structuredClone(ACTIVITIES_BY_FISCAL_YEAR),
    summonses,
  }
  return { ...data, auditLog: generateAuditLog(data) }
}

/** Un cheque de gerencia en canje en cada municipio que los recibe en algún formulario. No usa el azar, para no cambiar el resto de los datos. */
function generateChecks(declarations: Declaration[], payments: Payment[]): Check[] {
  const replaced = new Set(declarations.map((d) => d.correctsId).filter(Boolean))
  const withPayment = new Set(payments.map((p) => p.declarationId))
  return MUNICIPALITIES.flatMap((m, i) => {
    const d = declarations.find(
      (x) =>
        x.municipalityId === m.id &&
        m.taxes[x.tax] &&
        m.checkPayment[x.tax] &&
        x.totalToPay > 0 &&
        !x.approval &&
        !replaced.has(x.id) &&
        !withPayment.has(x.id),
    )
    const official = USERS.find((u) => u.municipalityId === m.id && u.role === 'official')
    if (!d || !official) return []
    return [
      {
        id: `ch${i + 1}`,
        declarationId: d.id,
        value: d.totalToPay,
        bank: 'Bancolombia',
        number: `00${4827 + i}`,
        receipt: `RC-00${4498 + i}`,
        receiptDate: '2026-10-20',
        receivedBy: fullName(official),
        status: 'in_clearing' as const,
      },
    ]
  })
}

/**
 * Recaudo de los tres años anteriores, por mes. Toma la forma del año de lo recaudado
 * en 2026 y la escala hacia atrás con un crecimiento de cerca del 6 % anual.
 */
function generateHistory(
  az: Random,
  declarations: Declaration[],
  payments: Payment[],
): MonthlyCollection[] {
  const byId = new Map(declarations.map((d) => [d.id, d]))
  const history: MonthlyCollection[] = []

  for (const m of MUNICIPALITIES) {
    const cfg = SETTINGS.find((c) => c.municipalityId === m.id)!
    const base = Array.from({ length: 12 }, () => ({ ica: 0, reteica: 0, selfWithholding: 0 }))
    for (const p of payments) {
      const d = byId.get(p.declarationId)
      if (d?.municipalityId !== m.id || !p.date.startsWith('2026')) continue
      base[Number(p.date.slice(5, 7)) - 1][d.tax] += p.value
    }

    // Retención y autorretención se pagan todos los periodos, con la periodicidad del calendario de 2026: se toma el
    // promedio de los periodos de 2026 que ya tienen recaudo y se reparte entre sus meses como se repartió en 2026.
    const byPeriod = (tax: Tax) => {
      const months = MONTHS_PER_PERIOD[formOf(cfg, tax, 2026).frequency]
      const periods = Array.from({ length: 12 / months }, (_, k) =>
        base.slice(k * months, (k + 1) * months).reduce((s, b) => s + b[tax], 0),
      ).filter((v) => v > 0)
      const total = periods.reduce((s, v) => s + v, 0)
      // La parte de cada mes del periodo; la del último es lo que les falta a los demás.
      const distribution = Array.from({ length: months - 1 }, (_, j) =>
        total === 0
          ? 1 / months
          : base.filter((_, i) => i % months === j).reduce((s, b) => s + b[tax], 0) / total,
      )
      distribution.push(1 - distribution.reduce((s, v) => s + v, 0))
      return { average: periods.length === 0 ? 0 : total / periods.length, distribution }
    }
    const reteica = byPeriod('reteica')
    const selfWithholding = byPeriod('selfWithholding')
    const inMonth = (b: { average: number; distribution: number[] }, i: number) =>
      b.average * b.distribution[i % b.distribution.length]

    for (const year of [2025, 2024, 2023]) {
      const factor = 0.94 ** (2026 - year)
      base.forEach((b, i) =>
        history.push({
          municipalityId: m.id,
          year,
          month: i + 1,
          values: {
            ica: roundToThousand(b.ica * factor * (0.9 + az.num() * 0.2)),
            reteica: roundToThousand(inMonth(reteica, i) * factor * (0.85 + az.num() * 0.3)),
            selfWithholding: roundToThousand(
              inMonth(selfWithholding, i) * factor * (0.85 + az.num() * 0.3),
            ),
          },
        }),
      )
    }
  }
  return history
}
