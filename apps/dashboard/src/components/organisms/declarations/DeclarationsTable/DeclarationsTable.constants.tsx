import { Link } from 'react-router'
import { Document, DocumentText } from 'reicon-react'
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
import type { Declaration } from '../../../../types'
import { Badge } from '../../../atoms'
import { col } from './DeclarationsTable.utils'

export const NUMBER_COLUMN = col.accessor((f) => f.d.number, {
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
      <Document className="size-4 text-brand-fg" aria-hidden />
      {d.number}
    </Link>
  ),
})

/** Al hacer clic en el número de factura se abre la vista previa del PDF de la declaración. */
export const invoiceColumn = (preview: (d: Declaration) => void) =>
  col.accessor((f) => f.d.invoiceNumber, {
    id: 'invoice',
    header: 'N.º de factura',
    meta: { classes: 'whitespace-nowrap tabular-nums text-fg' },
    cell: ({
      row: {
        original: { d },
      },
    }) => (
      // El pseudo-elemento invisible reserva el ancho en negrita, para que la columna no salte con el hover.
      <button
        type="button"
        onClick={() => preview(d)}
        aria-label={`Ver la factura ${d.invoiceNumber}`}
        className="group inline-flex cursor-pointer items-center gap-1.5 rounded tabular-nums text-fg hover:text-fg-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border"
      >
        <DocumentText className="size-4 shrink-0 text-brand-fg" aria-hidden />
        <span
          data-text={d.invoiceNumber}
          className="inline-flex flex-col after:invisible after:block after:h-0 after:overflow-hidden after:font-bold after:content-[attr(data-text)] group-hover:font-bold group-focus-visible:font-bold"
        >
          {d.invoiceNumber}
        </span>
      </button>
    ),
  })

export const COLUMNS = col.columns([
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
        <p className="text-fg-strong">{declarationTypeText(d.kind, downward)}</p>
        {corrects && <p className="text-xs tabular-nums text-fg-muted">Corrige la {corrects}</p>}
        {d.closingDate && (
          <p className="text-xs text-fg-muted">Cierre: {formatDate(d.closingDate)}</p>
        )}
        {c && (
          <div className="mt-1">
            <Badge tone={correctionTone[c.status]}>
              Solicitud {correctionStatusLabel[c.status].toLowerCase()}
            </Badge>
            {correctionToResolve(c) && (
              <p className="mt-1 text-xs text-fg-muted">Plazo: {formatDate(c.limit)}</p>
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
        <p className="truncate text-fg">{f.name}</p>
        {f.unregistered && <p className="text-xs text-warning-fg">No inscrito en el RIT</p>}
      </>
    ),
  }),
  col.accessor((f) => f.document, {
    id: 'idDocument',
    header: 'Documento',
    meta: { classes: 'whitespace-nowrap tabular-nums text-fg' },
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
        <p className="text-fg-strong">{taxLabel[d.tax]}</p>
        <p className="text-xs text-fg-muted">{periodLabel(d)}</p>
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
        <p className="text-fg">{formatDate(d.filingDate)}</p>
        {/* Solo la inicial es extemporánea: la corrección se presenta después del vencimiento sin serlo. */}
        {d.kind === 'initial' && d.filingDate > d.dueDate && (
          <p className="text-xs text-warning-fg">Extemporánea</p>
        )}
        {withoutCalendar && <p className="text-xs text-warning-fg">Sin calendario cargado</p>}
      </>
    ),
  }),
  col.accessor((f) => f.d.totalToPay, {
    id: 'total',
    header: 'Total a pagar',
    meta: { align: 'right', classes: 'whitespace-nowrap tabular-nums text-fg-strong' },
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
        <span className="text-fg-subtle">No aplica</span>
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
            <p className="mt-1 whitespace-nowrap text-xs text-fg-muted">
              Plazo: {formatDate(a.limit)}
            </p>
          )}
        </>
      ) : (
        <span className="text-fg-subtle">No aplica</span>
      ),
  },
)

export const INITIAL_ORDER = [{ id: 'filing', desc: true }]
