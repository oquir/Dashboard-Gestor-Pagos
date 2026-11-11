import { Link } from 'react-router'
import {
  paymentStatusLabel,
  taxLabel,
  periodLabel,
  formatPesos,
  columnHelper,
  paymentTone,
  statementPath,
} from '../../../../lib'
import type { ReceivablesRow } from '../../../../types'
import { Badge } from '../../../atoms'

const VALUE = {
  align: 'right',
  classes: 'whitespace-nowrap tabular-nums text-slate-700',
} as const

const col = columnHelper<ReceivablesRow>()

export const COLUMNS = col.columns([
  col.accessor('name', {
    header: 'Contribuyente',
    meta: { classes: 'max-w-64 truncate' },
    // Lleva al estado de cuenta del contribuyente, que se reconoce por su documento.
    cell: ({ row: { original: f } }) => (
      <Link
        to={statementPath(f.d.municipalityId, f.d.taxpayer)}
        aria-label={`Ver el estado de cuenta de ${f.name}`}
        className="font-medium text-slate-900 hover:text-brand-700"
      >
        {f.name}
      </Link>
    ),
  }),
  col.accessor((f) => f.d.number, {
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
          className="font-medium text-slate-900 hover:text-brand-700"
        >
          {d.number}
        </Link>
        <p className="text-xs text-slate-500">
          {taxLabel[d.tax]} · {periodLabel(d)}
        </p>
      </>
    ),
  }),
  col.accessor((f) => f.d.invoiceNumber, {
    id: 'invoice',
    header: 'N.º de factura',
    meta: { classes: 'whitespace-nowrap tabular-nums text-slate-700' },
  }),
  col.accessor((f) => f.d.totalToPay, {
    id: 'total',
    header: 'Total a pagar',
    meta: VALUE,
    cell: ({ getValue }) => formatPesos(getValue()),
  }),
  col.accessor('paidAmount', {
    header: 'Pagado',
    meta: VALUE,
    cell: ({ getValue }) => formatPesos(getValue()),
  }),
  col.accessor((f) => f.d.totalToPay - f.paidAmount, {
    id: 'balance',
    header: 'Saldo',
    meta: {
      align: 'right',
      classes: 'whitespace-nowrap tabular-nums font-medium text-slate-900',
    },
    cell: ({ getValue }) => formatPesos(getValue()),
  }),
  col.accessor((f) => paymentStatusLabel[f.status], {
    id: 'status',
    header: 'Estado',
    cell: ({ row: { original: f } }) => (
      <Badge tone={paymentTone[f.status]}>{paymentStatusLabel[f.status]}</Badge>
    ),
  }),
])

export const INITIAL_ORDER = [{ id: 'balance', desc: true }]
