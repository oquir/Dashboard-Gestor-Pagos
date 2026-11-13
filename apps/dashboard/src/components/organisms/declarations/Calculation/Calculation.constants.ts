import { formatPesos, columnHelper } from '../../../../lib'
import type { Line } from '../../../../types'

const col = columnHelper<Line>()

// Sin ordenamiento: la liquidación se lee en el orden del formulario.
export const LINE_COLUMNS = col.columns([
  col.accessor('code', {
    header: 'Renglón',
    enableSorting: false,
    meta: { classes: 'w-20 tabular-nums text-fg-muted' },
  }),
  col.accessor('concept', {
    header: 'Concepto',
    enableSorting: false,
    meta: { classes: 'text-fg' },
  }),
  col.accessor('value', {
    header: 'Valor',
    enableSorting: false,
    meta: { align: 'right', classes: 'whitespace-nowrap tabular-nums text-fg-strong' },
    cell: ({ getValue }) => formatPesos(getValue()),
  }),
])
