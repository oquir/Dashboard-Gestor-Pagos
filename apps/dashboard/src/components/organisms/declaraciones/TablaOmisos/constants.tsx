import { Link } from 'react-router'
import { etiquetaImpuesto, etiquetaPeriodo, formatoDocumento, formatoFecha, formatoHaceDias } from '../../../../lib/formato'
import { diferenciaDias, hoy } from '../../../../utils'
import { col } from './utils'

export const COLUMNAS = col.columns([
  col.accessor((o) => o.inscripcion.nombre, {
    id: 'contribuyente',
    header: 'Contribuyente',
    meta: { clase: 'max-w-72' },
    cell: ({ row: { original: { inscripcion: i } } }) => (
      <>
        <Link to={`/rit/${i.id}`} className="block truncate font-medium text-slate-900 hover:text-brand-700">
          {i.nombre}
        </Link>
        <p className="truncate text-xs tabular-nums text-slate-500">
          {formatoDocumento(i)} · RIT {i.numeroRit}
          {i.estado === 'cancelada' && ' · RIT cancelado'}
        </p>
      </>
    ),
  }),
  col.accessor((o) => `${o.impuesto}-${o.vigencia}-${String(o.periodo).padStart(2, '0')}`, {
    id: 'periodo',
    header: 'Impuesto y periodo',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ row: { original: o } }) => (
      <>
        <p className="text-slate-900">{etiquetaImpuesto[o.impuesto]}</p>
        <p className="text-xs text-slate-500">{etiquetaPeriodo(o)}</p>
      </>
    ),
  }),
  col.accessor('vencimiento', {
    header: 'Venció',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ getValue }) => (
      <>
        <p className="text-slate-700">{formatoFecha(getValue())}</p>
        <p className="text-xs text-red-700">{formatoHaceDias(diferenciaDias(getValue(), hoy()))}</p>
      </>
    ),
  }),
  col.accessor((o) => o.inscripcion.correo, {
    id: 'contacto',
    header: 'Contacto',
    meta: { clase: 'max-w-64' },
    cell: ({ row: { original: { inscripcion: i } } }) => (
      <>
        <p className="truncate tabular-nums text-slate-700">{i.telefono}</p>
        <p className="truncate text-xs text-slate-500">{i.correo}</p>
      </>
    ),
  }),
])

/** Primero lo que lleva más tiempo vencido. */
export const ORDEN_INICIAL = [{ id: 'vencimiento', desc: false }]
