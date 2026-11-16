import { Link } from 'react-router'
import {
  approvalStatusLabel,
  approvalTone,
  awaitsApproval,
  columnHelper,
  formatDate,
  formatPesos,
  paymentStatusLabel,
  paymentTone,
} from '../../../lib'
import type { StatementRow } from '../../../types'
import { Badge } from '../../atoms'

// Columnas que comparten las dos tablas del estado de cuenta.

export const col = columnHelper<StatementRow>()

export const VALUE = {
  align: 'right',
  classes: 'whitespace-nowrap tabular-nums text-fg',
} as const

/** El radicado lleva al detalle de la declaración; debajo, su factura y su vencimiento. */
export const declarationColumn = col.accessor((r) => r.d.number, {
  id: 'declaration',
  header: 'Declaración',
  meta: { classes: 'whitespace-nowrap' },
  cell: ({
    row: {
      original: { d },
    },
  }) => (
    <>
      <Link
        to={`/declaraciones/${d.id}`}
        className="font-medium text-fg-strong hover:text-brand-fg"
      >
        {d.number}
      </Link>
      <p className="text-xs tabular-nums text-fg-muted">
        Factura {d.invoiceNumber} · vence {formatDate(d.dueDate)}
      </p>
    </>
  ),
})

export const totalColumn = col.accessor((r) => r.d.totalToPay, {
  id: 'total',
  header: 'Total a pagar',
  meta: VALUE,
  cell: ({ getValue }) => formatPesos(getValue()),
})

export const paidColumn = col.accessor('paidAmount', {
  header: 'Pagado',
  meta: VALUE,
  cell: ({ getValue }) => formatPesos(getValue()),
})

/**
 * Mientras la declaración espera la aprobación previa o se tiene por no presentada, el estado es el de esa aprobación:
 * todavía no se puede pagar. Debajo van los avisos que cambian lo que se debe.
 */
export const statusColumn = col.accessor((r) => paymentStatusLabel[r.status], {
  id: 'status',
  header: 'Estado',
  cell: ({ row: { original: r } }) => {
    const approval = r.approval
    const byApproval = awaitsApproval(approval) || approval?.status === 'rejected'
    return (
      <>
        {approval && byApproval ? (
          <Badge tone={approvalTone[approval.status]}>{approvalStatusLabel[approval.status]}</Badge>
        ) : (
          <Badge tone={paymentTone[r.status]}>{paymentStatusLabel[r.status]}</Badge>
        )}
        {r.inClearing > 0 && (
          <p className="mt-1 whitespace-nowrap text-xs text-fg-muted">
            En canje {formatPesos(r.inClearing)}
          </p>
        )}
        {r.excess > 0 && (
          <p className="mt-1 whitespace-nowrap text-xs text-fg-muted">
            Pago en exceso {formatPesos(r.excess)}
          </p>
        )}
        {r.pendingCorrection && (
          <Link
            to={`/declaraciones/${r.pendingCorrection.id}`}
            className="mt-1 block whitespace-nowrap text-xs text-warning-fg hover:underline"
          >
            Solicitud de corrección por resolver
          </Link>
        )}
      </>
    )
  },
})
