import { Link } from 'react-router'
import { taxLabel, periodLabel, documentFormat, formatDate, formatDaysAgo } from '../../../../lib'
import { dayDifference, today } from '../../../../utils'
import { col } from './NonFilersTable.utils'

export const COLUMNS = col.columns([
  col.accessor((o) => o.registration.name, {
    id: 'taxpayer',
    header: 'Contribuyente',
    meta: { classes: 'max-w-72' },
    cell: ({
      row: {
        original: { registration: i },
      },
    }) => (
      <>
        <Link
          to={`/rit/${i.id}`}
          className="block truncate font-medium text-slate-900 hover:text-brand-700"
        >
          {i.name}
        </Link>
        <p className="truncate text-xs tabular-nums text-slate-500">
          {documentFormat(i)} · RIT {i.ritNumber}
          {i.status === 'cancelled' && ' · RIT cancelado'}
        </p>
      </>
    ),
  }),
  col.accessor((o) => `${o.tax}-${o.fiscalYear}-${String(o.period).padStart(2, '0')}`, {
    id: 'period',
    header: 'Impuesto y periodo',
    meta: { classes: 'whitespace-nowrap' },
    cell: ({ row: { original: o } }) => (
      <>
        <p className="text-slate-900">{taxLabel[o.tax]}</p>
        <p className="text-xs text-slate-500">{periodLabel(o)}</p>
      </>
    ),
  }),
  col.accessor('dueDateItem', {
    header: 'Venció',
    meta: { classes: 'whitespace-nowrap' },
    cell: ({ getValue }) => (
      <>
        <p className="text-slate-700">{formatDate(getValue())}</p>
        <p className="text-xs text-red-700">{formatDaysAgo(dayDifference(getValue(), today()))}</p>
      </>
    ),
  }),
  col.accessor((o) => o.registration.email, {
    id: 'contact',
    header: 'Contacto',
    meta: { classes: 'max-w-64' },
    cell: ({
      row: {
        original: { registration: i },
      },
    }) => (
      <>
        <p className="truncate tabular-nums text-slate-700">{i.phone}</p>
        <p className="truncate text-xs text-slate-500">{i.email}</p>
      </>
    ),
  }),
])

/** Primero lo que lleva más tiempo vencido. */
export const INITIAL_ORDER = [{ id: 'dueDateItem', desc: false }]
