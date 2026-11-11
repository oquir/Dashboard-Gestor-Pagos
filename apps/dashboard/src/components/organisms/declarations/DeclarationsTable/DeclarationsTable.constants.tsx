import { Link } from 'react-router'
import { Document } from 'reicon-react'
import { ROW_BUTTON_CLASS } from '../../../../constants'
import {
  approvalStatusLabel,
  correctionStatusLabel,
  paymentStatusLabel,
  taxLabel,
  periodLabel,
  formatDate,
  formatPesos,
  declarationTypeText,
  correctionToResolve,
  awaitsApproval,
  approvalTone,
  correctionTone,
  paymentTone,
} from '../../../../lib'
import { Badge } from '../../../atoms'
import { col } from './DeclarationsTable.utils'

export const COLUMNS = col.columns([
  col.accessor((f) => f.d.number, {
    id: 'number',
    header: 'Radicado',
    meta: { classes: 'whitespace-nowrap' },
    cell: ({
      row: {
        original: { d },
      },
    }) => (
      <Link
        to={`/declaraciones/${d.id}`}
        aria-label={`Ver la declaración ${d.number}`}
        className={ROW_BUTTON_CLASS}
      >
        <Document className="size-4 text-brand-600" aria-hidden />
        {d.number}
      </Link>
    ),
  }),
  col.accessor((f) => f.d.invoiceNumber, {
    id: 'invoice',
    header: 'N.º de factura',
    meta: { classes: 'whitespace-nowrap tabular-nums text-slate-700' },
  }),
  col.accessor((f) => declarationTypeText(f.d.kind, f.downward), {
    id: 'kind',
    header: 'Tipo de declaración',
    meta: { classes: 'whitespace-nowrap' },
    cell: ({
      row: {
        original: { d, corrects, downward, correction: c },
      },
    }) => (
      <>
        <p className="text-slate-900">{declarationTypeText(d.kind, downward)}</p>
        {corrects && <p className="text-xs tabular-nums text-slate-500">Corrige la {corrects}</p>}
        {d.closingDate && (
          <p className="text-xs text-slate-500">Cierre: {formatDate(d.closingDate)}</p>
        )}
        {c && (
          <div className="mt-1">
            <Badge tone={correctionTone[c.status]}>
              Solicitud {correctionStatusLabel[c.status].toLowerCase()}
            </Badge>
            {correctionToResolve(c) && (
              <p className="mt-1 text-xs text-slate-500">Plazo: {formatDate(c.limit)}</p>
            )}
          </div>
        )}
      </>
    ),
  }),
  col.accessor('name', {
    header: 'Contribuyente',
    meta: { classes: 'max-w-64' },
    cell: ({ row: { original: f } }) => (
      <>
        <p className="truncate text-slate-700">{f.name}</p>
        <p className="truncate text-xs tabular-nums text-slate-500">{f.document}</p>
        {f.unregistered && <p className="text-xs text-amber-700">No inscrito en el RIT</p>}
      </>
    ),
  }),
  col.accessor((f) => `${f.d.tax}-${f.d.fiscalYear}-${f.d.period}`, {
    id: 'period',
    header: 'Impuesto y periodo',
    meta: { classes: 'whitespace-nowrap' },
    cell: ({
      row: {
        original: { d },
      },
    }) => (
      <>
        <p className="text-slate-900">{taxLabel[d.tax]}</p>
        <p className="text-xs text-slate-500">{periodLabel(d)}</p>
      </>
    ),
  }),
  col.accessor((f) => f.d.filingDate, {
    id: 'filing',
    header: 'Presentación',
    meta: { classes: 'whitespace-nowrap' },
    cell: ({
      row: {
        original: { d, withoutCalendar },
      },
    }) => (
      <>
        <p className="text-slate-700">{formatDate(d.filingDate)}</p>
        {/* Solo la inicial es extemporánea: la corrección se presenta después del vencimiento sin serlo. */}
        {d.kind === 'initial' && d.filingDate > d.dueDate && (
          <p className="text-xs text-amber-700">Extemporánea</p>
        )}
        {withoutCalendar && <p className="text-xs text-amber-700">Sin calendario cargado</p>}
      </>
    ),
  }),
  col.accessor((f) => f.d.totalToPay, {
    id: 'total',
    header: 'Total a pagar',
    meta: { align: 'right', classes: 'whitespace-nowrap tabular-nums text-slate-900' },
    cell: ({ getValue }) => formatPesos(getValue()),
  }),
  col.accessor((f) => (f.payment ? paymentStatusLabel[f.payment] : ''), {
    id: 'payment',
    header: 'Pago',
    // La solicitud de corrección que no se ha aceptado no se paga.
    cell: ({ row: { original: f } }) =>
      f.payment ? (
        <Badge tone={paymentTone[f.payment]}>{paymentStatusLabel[f.payment]}</Badge>
      ) : (
        <span className="text-slate-400">No aplica</span>
      ),
  }),
])

/** Solo cuando hay declaraciones con aprobación previa; mientras está pendiente, muestra el plazo. */
export const APPROVAL_COLUMN = col.accessor(
  (f) => (f.approval ? approvalStatusLabel[f.approval.status] : ''),
  {
    id: 'approval',
    header: 'Aprobación',
    cell: ({
      row: {
        original: { approval: a },
      },
    }) =>
      a ? (
        <>
          <Badge tone={approvalTone[a.status]}>{approvalStatusLabel[a.status]}</Badge>
          {awaitsApproval(a) && (
            <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
              Plazo: {formatDate(a.limit)}
            </p>
          )}
        </>
      ) : (
        <span className="text-slate-400">No aplica</span>
      ),
  },
)

export const INITIAL_ORDER = [{ id: 'filing', desc: true }]
