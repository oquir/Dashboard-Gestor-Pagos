import { Link } from 'react-router'
import { taxLabel, formatDate, formatPesos, columnHelper } from '../../../../lib'
import type { PaymentRow } from '../../../../types'

const col = columnHelper<PaymentRow>()

export const COLUMNS = col.columns([
  col.accessor((f) => f.p.date, {
    id: 'date',
    header: 'Fecha',
    meta: { classes: 'whitespace-nowrap text-fg' },
    cell: ({ getValue }) => formatDate(getValue()),
  }),
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
        <Link to={`/declaraciones/${d.id}`} className="text-fg-strong hover:text-brand-fg">
          {d.number}
        </Link>
        <span className="text-xs text-fg-muted"> · {taxLabel[d.tax]}</span>
      </>
    ),
  }),
  col.accessor((f) => f.d.invoiceNumber, {
    id: 'invoice',
    header: 'N.º de factura',
    meta: { classes: 'whitespace-nowrap tabular-nums text-fg' },
  }),
  col.accessor((f) => f.p.value, {
    id: 'value',
    header: 'Valor',
    meta: { align: 'right', classes: 'whitespace-nowrap tabular-nums text-fg-strong' },
    cell: ({ getValue }) => formatPesos(getValue()),
  }),
])

export const INITIAL_ORDER = [{ id: 'date', desc: true }]
