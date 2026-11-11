import { declarationTypeLabel, formatPesos } from '../../../../lib'
import {
  col,
  declarationColumn,
  paidColumn,
  statusColumn,
  totalColumn,
  VALUE,
} from '../Statement.columns'

export const COLUMNS = col.columns([
  col.accessor((r) => r.d.fiscalYear, {
    id: 'fiscalYear',
    header: 'Año gravable',
    meta: { classes: 'whitespace-nowrap' },
    cell: ({
      row: {
        original: { d },
      },
    }) => (
      <>
        <p className="font-medium text-slate-900">{d.fiscalYear}</p>
        <p className="text-xs text-slate-500">{declarationTypeLabel[d.kind]}</p>
      </>
    ),
  }),
  declarationColumn,
  totalColumn,
  paidColumn,
  col.accessor((r) => r.balance, {
    id: 'balance',
    header: 'Saldo',
    meta: { ...VALUE, classes: 'whitespace-nowrap tabular-nums font-medium text-slate-900' },
    // Lo que aún no se puede pagar, o que no tiene valor, no es deuda.
    cell: ({ row: { original: r } }) =>
      r.payable ? formatPesos(r.balance) : <span className="text-slate-400">—</span>,
  }),
  statusColumn,
])

export const INITIAL_ORDER = [{ id: 'fiscalYear', desc: true }]
