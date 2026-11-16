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

const DATE = { classes: 'whitespace-nowrap tabular-nums text-fg' } as const

const col = columnHelper<UnremittedRow>()

export const COLUMNS = col.columns([
  col.accessor('name', {
    header: 'Contribuyente',
    meta: { classes: 'max-w-64 truncate text-fg-strong' },
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
          className="font-medium text-fg-strong hover:text-brand-fg"
        >
          {d.number}
        </Link>
        <p className="text-xs text-fg-muted">
          {taxLabel[d.tax]} · {periodLabel(d)}
        </p>
      </>
    ),
  }),
  col.accessor((f) => f.d.dueDate, {
    id: 'dueDate',
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
      classes: 'whitespace-nowrap tabular-nums font-medium text-fg-strong',
    },
    cell: ({ getValue }) => formatPesos(getValue()),
  }),
])

/** Primero lo que lleva más tiempo vencido; después, lo que vence antes. */
export const INITIAL_ORDER = [{ id: 'limit', desc: false }]
