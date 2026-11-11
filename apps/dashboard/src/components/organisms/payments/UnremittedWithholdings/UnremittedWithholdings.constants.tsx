import { Link } from 'react-router'
import {
  taxLabel,
  periodLabel,
  formatDate,
  formatPesos,
  remittanceTerm,
  columnHelper,
  remittanceTone,
} from '../../../../lib'
import type { UnremittedRow } from '../../../../types'
import { Badge } from '../../../atoms'

const DATE = { classes: 'whitespace-nowrap tabular-nums text-slate-700' } as const

const col = columnHelper<UnremittedRow>()

export const COLUMNS = col.columns([
  col.accessor('name', {
    header: 'Contribuyente',
    meta: { classes: 'max-w-64 truncate text-slate-900' },
  }),
  col.accessor((f) => f.d.number, {
    id: 'declaracion',
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
  col.accessor((f) => f.d.dueDate, {
    id: 'vencimiento',
    header: 'Vencimiento',
    meta: DATE,
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  col.accessor('limit', {
    header: 'Límite para consignar',
    meta: DATE,
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  col.accessor('days', {
    header: 'Plazo',
    meta: { classes: 'whitespace-nowrap' },
    cell: ({ getValue }) => (
      <Badge tone={remittanceTone(getValue())}>{remittanceTerm(getValue())}</Badge>
    ),
  }),
  col.accessor('balance', {
    header: 'Sin consignar',
    meta: {
      align: 'right',
      classes: 'whitespace-nowrap tabular-nums font-medium text-slate-900',
    },
    cell: ({ getValue }) => formatPesos(getValue()),
  }),
])

/** Primero lo que lleva más tiempo vencido; después, lo que vence antes. */
export const INITIAL_ORDER = [{ id: 'limite', desc: false }]
