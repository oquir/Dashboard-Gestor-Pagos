import { Link } from 'react-router'
import { etiquetaImpuesto, etiquetaPeriodo, formatoFecha, formatoPesos, plazoConsignacion } from '../../../../lib/formato'
import { ayudanteColumnas } from '../../../../lib/tabla'
import { tonoConsignacion } from '../../../../lib/tonos'
import type { FilaSinConsignar } from '../../../../types'
import { Badge } from '../../../atoms'

const FECHA = { clase: 'whitespace-nowrap tabular-nums text-slate-700' } as const

const col = ayudanteColumnas<FilaSinConsignar>()

export const COLUMNAS = col.columns([
  col.accessor('nombre', { header: 'Declarante', meta: { clase: 'max-w-64 truncate text-slate-900' } }),
  col.accessor((f) => f.d.numero, {
    id: 'declaracion',
    header: 'Declaración',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ row: { original: { d } } }) => (
      <>
        <Link to={`/declaraciones/${d.id}`} className="font-medium text-slate-900 hover:text-brand-700">{d.numero}</Link>
        <p className="text-xs text-slate-500">
          {etiquetaImpuesto[d.impuesto]} · {etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo)}
        </p>
      </>
    ),
  }),
  col.accessor((f) => f.d.fechaVencimiento, { id: 'vencimiento', header: 'Vencimiento', meta: FECHA, cell: ({ getValue }) => formatoFecha(getValue()) }),
  col.accessor('limite', { header: 'Límite para consignar', meta: FECHA, cell: ({ getValue }) => formatoFecha(getValue()) }),
  col.accessor('dias', {
    header: 'Plazo',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ getValue }) => <Badge tono={tonoConsignacion(getValue())}>{plazoConsignacion(getValue())}</Badge>,
  }),
  col.accessor('saldo', {
    header: 'Sin consignar',
    meta: { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums font-medium text-slate-900' },
    cell: ({ getValue }) => formatoPesos(getValue()),
  }),
])

/** Primero lo que lleva más tiempo vencido; después, lo que vence antes. */
export const ORDEN_INICIAL = [{ id: 'limite', desc: false }]
