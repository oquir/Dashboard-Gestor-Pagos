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
          className="block truncate font-medium text-fg-strong hover:text-brand-fg"
        >
          {i.name}
        </Link>
        <p className="truncate text-xs tabular-nums text-fg-muted">
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
        <p className="text-fg-strong">{taxLabel[o.tax]}</p>
        <p className="text-xs text-fg-muted">{periodLabel(o)}</p>
      </>
    ),
  }),
  col.accessor('dueDateItem', {
    header: 'Venció',
    meta: { classes: 'whitespace-nowrap' },
    cell: ({ getValue }) => (
      <>
        <p className="text-fg">{formatDate(getValue())}</p>
        <p className="text-xs text-danger-fg">
          {formatDaysAgo(dayDifference(getValue(), today()))}
        </p>
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
        <p className="truncate tabular-nums text-fg">{i.phone}</p>
        <p className="truncate text-xs text-fg-muted">{i.email}</p>
      </>
    ),
  }),
])

/** Primero lo que lleva más tiempo vencido. */
export const INITIAL_ORDER = [{ id: 'dueDateItem', desc: false }]
