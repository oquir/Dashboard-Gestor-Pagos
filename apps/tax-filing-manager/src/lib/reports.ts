// Reportes del municipio: sus columnas (para la tabla y el Excel), sus filas y sus gráficas por categoría.
import { SERIES_CLASS } from '../constants/styles'
import type {
  Bar,
  Declaration,
  PaymentStatus,
  ApprovalFilter,
  ChartFormat,
  Tax,
  Registration,
  Municipality,
  Payment,
} from '../types'
import { today } from '../utils'
import {
  capacityLabel,
  approvalStatusLabel,
  correctionStatusLabel,
  registrationStatusLabel,
  paymentStatusLabel,
  taxLabel,
  periodLabel,
  declarationTypeLabel,
  personTypeLabel,
  documentFormat,
  MONTHS,
  declarationTypeText,
} from './format'
import {
  currentCorrection,
  isDownwardCorrection,
  replaced as calcularReemplazadas,
  canBePaid,
  totalPaid,
} from './rules'
import type { ApprovalSituation, CorrectionSituation } from './rules'
import { withRit, ofMunicipality, visibleTaxes } from './session'

export type ReportId = 'declarations' | 'collection' | 'receivables' | 'rit'

/** Nombre de cada reporte en el archivo que se descarga (lo ve el usuario). */
export const REPORT_FILE_NAMES: Record<ReportId, string> = {
  declarations: 'declaraciones',
  collection: 'recaudo',
  receivables: 'cartera',
  rit: 'rit',
}
export type DataRow = (string | number)[]

export interface TableColumn {
  title: string
  /** Ancho en Excel, en caracteres. */
  width: number
  format?: 'pesos' | 'date'
}

export interface Chart {
  title: string
  description?: string
  format: ChartFormat
  bars: Bar[]
}

export interface Report {
  id: ReportId
  tab: string
  title: string
  description: string
  byDates: boolean
}

export const REPORTS: Report[] = [
  {
    id: 'declarations',
    tab: 'Declaraciones',
    title: 'Declaraciones presentadas',
    description: 'Declaraciones presentadas en el rango, con su liquidación y su pago.',
    byDates: true,
  },
  {
    id: 'collection',
    tab: 'Recaudo',
    title: 'Recaudo',
    description: 'Pagos recibidos en el rango, uno por fila, con la declaración que pagan.',
    byDates: true,
  },
  {
    id: 'receivables',
    tab: 'Cartera',
    title: 'Cartera pendiente',
    description: 'Declaraciones vigentes con saldo por pagar, al día de hoy.',
    byDates: false,
  },
  {
    id: 'rit',
    tab: 'RIT',
    title: 'Inscritos en el RIT',
    description:
      'Inscripciones con sus datos de contacto, calidades y actividad principal, al día de hoy.',
    byDates: false,
  },
]

const MUNICIPALITY: TableColumn = { title: 'Municipio', width: 16 }
const FILING_NUMBER: TableColumn = { title: 'Radicado', width: 18 }
const INVOICE: TableColumn = { title: 'N.º de factura', width: 14 }
const TAX: TableColumn = { title: 'Impuesto', width: 13 }
const PERIOD: TableColumn = { title: 'Periodo', width: 20 }
const TAXPAYER: TableColumn = { title: 'Contribuyente', width: 36 }
const DOCUMENT: TableColumn = { title: 'Documento', width: 18 }
const DUE_DATE: TableColumn = { title: 'Vencimiento', width: 13, format: 'date' }
const TOTAL: TableColumn = { title: 'Total a pagar', width: 16, format: 'pesos' }
const PAID: TableColumn = { title: 'Pagado', width: 16, format: 'pesos' }
const PAYMENT_STATUS: TableColumn = { title: 'Estado de pago', width: 24 }
const APPROVAL: TableColumn = { title: 'Aprobación', width: 26 }

export const COLUMNS: Record<ReportId, TableColumn[]> = {
  declarations: [
    MUNICIPALITY,
    FILING_NUMBER,
    INVOICE,
    TAX,
    PERIOD,
    { title: 'Tipo', width: 30 },
    TAXPAYER,
    DOCUMENT,
    { title: 'Presentación', width: 13, format: 'date' },
    DUE_DATE,
    TOTAL,
    PAID,
    PAYMENT_STATUS,
    APPROVAL,
  ],
  collection: [
    MUNICIPALITY,
    { title: 'Fecha de pago', width: 13, format: 'date' },
    FILING_NUMBER,
    INVOICE,
    TAX,
    PERIOD,
    TAXPAYER,
    DOCUMENT,
    { title: 'Medio de pago', width: 18 },
    { title: 'Valor', width: 16, format: 'pesos' },
  ],
  receivables: [
    MUNICIPALITY,
    FILING_NUMBER,
    INVOICE,
    TAX,
    PERIOD,
    TAXPAYER,
    DOCUMENT,
    DUE_DATE,
    TOTAL,
    PAID,
    { title: 'Saldo', width: 16, format: 'pesos' },
    PAYMENT_STATUS,
  ],
  rit: [
    MUNICIPALITY,
    { title: 'N.º de RIT', width: 12 },
    { title: 'Nombre o razón social', width: 36 },
    DOCUMENT,
    { title: 'Tipo de persona', width: 18 },
    { title: 'Estado', width: 13 },
    { title: 'Calidades', width: 30 },
    { title: 'Actividad principal', width: 50 },
    { title: 'Dirección', width: 30 },
    { title: 'Teléfono', width: 14 },
    { title: 'Correo', width: 30 },
  ],
}

/** Sin declaraciones con aprobación previa, el reporte de declaraciones va sin esa columna, que es la última. */
export const NO_APPROVAL = COLUMNS.declarations.slice(0, -1)

const DAY = 24 * 60 * 60 * 1000

/** Cuenta o suma por categoría, en el orden de las etiquetas. */
function groupBy<T, K extends string>(
  items: T[],
  labels: Record<K, string>,
  key: (item: T) => K,
  value: (item: T) => number = () => 1,
): Bar[] {
  return (Object.keys(labels) as K[]).map((k) => ({
    label: labels[k],
    value: items.filter((x) => key(x) === k).reduce((s, x) => s + value(x), 0),
  }))
}

/** Antigüedad de la deuda según los días desde el vencimiento. */
function age(dueDate: string) {
  const days = Math.floor((Date.parse(today()) - Date.parse(dueDate)) / DAY)
  if (days <= 0) return 'not_due'
  if (days <= 30) return 'up_to_30'
  if (days <= 90) return 'up_to_90'
  if (days <= 180) return 'up_to_180'
  return 'over_180'
}

const ageLabel: Record<ReturnType<typeof age>, string> = {
  not_due: 'Por vencer',
  up_to_30: 'Vencida hace 1 a 30 días',
  up_to_90: 'Vencida hace 31 a 90 días',
  up_to_180: 'Vencida hace 91 a 180 días',
  over_180: 'Vencida hace más de 180 días',
}

/** Los estados de pago en que una declaración puede quedar con saldo. */
const STATUSES_WITH_BALANCE = {
  no_payment: paymentStatusLabel.no_payment,
  partial: paymentStatusLabel.partial,
  ineffective: paymentStatusLabel.ineffective,
}

interface Source {
  /** Las del municipio que se está viendo, solo de los impuestos activos. */
  declarations: Declaration[]
  /** Todas: aquí se filtran por municipio. */
  registrations: Registration[]
  payments: Payment[]
  municipalities: Municipality[]
  municipalityId: string | null
  from: string
  to: string
  invalidRange: boolean
  approval: (d: Declaration) => ApprovalSituation | undefined
  correction: (d: Declaration) => CorrectionSituation | undefined
  /** Estado del pago al día de hoy, con el plazo de 2 meses de la retención si el municipio lo da. */
  statusOf: (d: Declaration) => PaymentStatus
  approvalStatus: ApprovalFilter
}

/** Filas y gráficas de cada reporte. Declaraciones y recaudo van por rango de fechas; cartera y RIT, al día de hoy. */
export function buildReports(
  source: Source,
): Record<ReportId, { rows: DataRow[]; charts: Chart[] }> {
  const {
    declarations,
    registrations: allItems,
    payments,
    municipalities,
    municipalityId,
    from,
    to,
    invalidRange,
    approval,
    correction,
    statusOf,
    approvalStatus,
  } = source
  const inRange = (date: string) => !invalidRange && date >= from && date <= to
  const registrations = ofMunicipality(allItems, municipalityId)
  const municipalityName = new Map(municipalities.map((m) => [m.id, m.name]))
  const replaced = calcularReemplazadas(declarations, correction)
  const declarationById = new Map(declarations.map((d) => [d.id, d]))
  const visible = visibleTaxes(municipalities, municipalityId)
  const byTax = <T>(
    items: T[],
    tax: (item: T) => Tax,
    value: (item: T) => number = () => 1,
  ): Bar[] =>
    visible.map((i) => ({
      label: taxLabel[i],
      value: items.filter((x) => tax(x) === i).reduce((s, x) => s + value(x), 0),
      classes: SERIES_CLASS[i],
    }))

  const filed = declarations
    .filter((d) => inRange(d.filingDate))
    .map((d) => ({
      d,
      paidAmount: totalPaid(d.id, payments),
      status: statusOf(d),
      a: approval(d),
      c: correction(d),
    }))
    .filter((f) => !approvalStatus || (f.a?.status ?? 'not_applicable') === approvalStatus)
  // La corrección a la baja se nombra así y, si se radicó como solicitud, lleva su estado.
  const kindOf = (d: Declaration, c: CorrectionSituation | undefined) => {
    const text = declarationTypeText(
      d.kind,
      isDownwardCorrection(d, d.correctsId ? declarationById.get(d.correctsId) : undefined),
    )
    return c ? `${text} (solicitud ${correctionStatusLabel[c.status].toLowerCase()})` : text
  }

  const received = payments.flatMap((p) => {
    const d = declarationById.get(p.declarationId)
    return d && inRange(p.date) ? [{ p, d }] : []
  })
  const methods = [...new Set(received.map(({ p }) => p.method))].sort()
  const months = [...new Set(received.map(({ p }) => p.date.slice(0, 7)))].sort()

  const receivables = declarations.flatMap((d) => {
    const paidAmount = totalPaid(d.id, payments)
    // Lo que aún espera la aprobación previa no se puede pagar, y la solicitud de corrección sin aceptar no se paga: no son cartera.
    if (
      replaced.has(d.id) ||
      d.totalToPay <= 0 ||
      paidAmount >= d.totalToPay ||
      !canBePaid(approval(d)) ||
      !currentCorrection(correction(d))
    )
      return []
    return [{ d, paidAmount, balance: d.totalToPay - paidAmount, status: statusOf(d) }]
  })

  const registered = registrations.filter(withRit(municipalities))

  return {
    declarations: {
      rows: filed.map(({ d, paidAmount, status, a, c }) => [
        municipalityName.get(d.municipalityId) ?? '',
        d.number,
        d.invoiceNumber,
        taxLabel[d.tax],
        periodLabel(d),
        kindOf(d, c),
        d.taxpayer.name,
        documentFormat(d.taxpayer),
        d.filingDate,
        d.dueDate,
        d.totalToPay,
        // La solicitud de corrección que no se ha aceptado no se paga.
        paidAmount,
        currentCorrection(c) ? paymentStatusLabel[status] : 'No aplica',
        a ? approvalStatusLabel[a.status] : 'No aplica',
      ]),
      charts: [
        {
          title: 'Por impuesto',
          description: 'Cantidad de declaraciones.',
          format: 'quantity',
          bars: byTax(filed, (f) => f.d.tax),
        },
        {
          title: 'Por estado de pago',
          description:
            'Cantidad de declaraciones, sin las solicitudes de corrección que no se han aceptado.',
          format: 'quantity',
          bars: groupBy(
            filed.filter((f) => currentCorrection(f.c)),
            paymentStatusLabel,
            (f) => f.status,
          ),
        },
        {
          title: 'Por tipo de declaración',
          description: 'Cantidad de declaraciones.',
          format: 'quantity',
          bars: groupBy(filed, declarationTypeLabel, (f) => f.d.kind),
        },
      ],
    },
    collection: {
      rows: received.map(({ p, d }) => [
        municipalityName.get(d.municipalityId) ?? '',
        p.date,
        d.number,
        d.invoiceNumber,
        taxLabel[d.tax],
        periodLabel(d),
        d.taxpayer.name,
        documentFormat(d.taxpayer),
        p.method,
        p.value,
      ]),
      charts: [
        {
          title: 'Por impuesto',
          description: 'Valor recaudado.',
          format: 'pesos',
          bars: byTax(
            received,
            (f) => f.d.tax,
            (f) => f.p.value,
          ),
        },
        {
          title: 'Por medio de pago',
          description: 'Valor recaudado.',
          format: 'pesos',
          bars: methods.map((m) => ({
            label: m,
            value: received.filter((f) => f.p.method === m).reduce((s, f) => s + f.p.value, 0),
          })),
        },
        {
          title: 'Por mes',
          description: 'Valor recaudado según la fecha de pago.',
          format: 'pesos',
          bars: months.map((m) => ({
            label: `${MONTHS[Number(m.slice(5)) - 1]} ${m.slice(0, 4)}`,
            value: received
              .filter((f) => f.p.date.startsWith(m))
              .reduce((s, f) => s + f.p.value, 0),
          })),
        },
      ],
    },
    receivables: {
      rows: receivables.map(({ d, paidAmount, balance, status }) => [
        municipalityName.get(d.municipalityId) ?? '',
        d.number,
        d.invoiceNumber,
        taxLabel[d.tax],
        periodLabel(d),
        d.taxpayer.name,
        documentFormat(d.taxpayer),
        d.dueDate,
        d.totalToPay,
        paidAmount,
        balance,
        paymentStatusLabel[status],
      ]),
      charts: [
        {
          title: 'Por impuesto',
          description: 'Saldo por pagar.',
          format: 'pesos',
          bars: byTax(
            receivables,
            (f) => f.d.tax,
            (f) => f.balance,
          ),
        },
        {
          title: 'Por estado de pago',
          description: 'Saldo por pagar.',
          format: 'pesos',
          bars: groupBy(
            receivables,
            STATUSES_WITH_BALANCE,
            (f) => f.status as keyof typeof STATUSES_WITH_BALANCE,
            (f) => f.balance,
          ),
        },
        {
          title: 'Por antigüedad',
          description: 'Saldo según los días desde el vencimiento.',
          format: 'pesos',
          bars: groupBy(
            receivables,
            ageLabel,
            (f) => age(f.d.dueDate),
            (f) => f.balance,
          ),
        },
      ],
    },
    rit: {
      rows: registered.map((i) => {
        const main = i.activities.find((a) => a.main)
        return [
          municipalityName.get(i.municipalityId) ?? '',
          i.ritNumber,
          i.name,
          documentFormat(i),
          personTypeLabel[i.personType],
          registrationStatusLabel[i.status],
          i.capacities.map((c) => capacityLabel[c.capacity]).join(', '),
          main ? `${main.ciiu} ${main.description}` : '',
          i.address,
          i.phone,
          i.email,
        ]
      }),
      charts: [
        {
          title: 'Por calidad',
          description: 'Una inscripción puede tener varias calidades.',
          format: 'quantity',
          bars: (Object.keys(capacityLabel) as (keyof typeof capacityLabel)[]).map((c) => ({
            label: capacityLabel[c],
            value: registered.filter((i) => i.capacities.some((q) => q.capacity === c)).length,
          })),
        },
        {
          title: 'Por estado',
          description: 'Cantidad de inscripciones.',
          format: 'quantity',
          bars: groupBy(registered, registrationStatusLabel, (i) => i.status),
        },
        {
          title: 'Por tipo de persona',
          description: 'Cantidad de inscripciones.',
          format: 'quantity',
          bars: groupBy(registered, personTypeLabel, (i) => i.personType),
        },
      ],
    },
  }
}
