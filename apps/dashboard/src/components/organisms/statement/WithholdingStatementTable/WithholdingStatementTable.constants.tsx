import { periodLabel, taxLabel } from '../../../../lib'
import { col, declarationColumn, paidColumn, statusColumn, totalColumn } from '../Statement.columns'

export const COLUMNS = col.columns([
  col.accessor((r) => `${r.d.tax}-${r.d.fiscalYear}-${r.d.period}`, {
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
  declarationColumn,
  totalColumn,
  paidColumn,
  statusColumn,
])
