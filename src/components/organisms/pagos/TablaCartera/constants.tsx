import { Link } from 'react-router'
import { etiquetaEstadoPago, etiquetaImpuesto, etiquetaPeriodo, formatoPesos } from '../../../../lib/formato'
import { ayudanteColumnas } from '../../../../lib/tabla'
import { tonoPago } from '../../../../lib/tonos'
import type { FilaCartera } from '../../../../types'
import { Badge } from '../../../atoms'

const VALOR = { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-700' } as const

const col = ayudanteColumnas<FilaCartera>()

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
  col.accessor((f) => f.d.numeroFactura, {
    id: 'factura',
    header: 'N.º de factura',
    meta: { clase: 'whitespace-nowrap tabular-nums text-slate-700' },
  }),
  col.accessor((f) => f.d.totalAPagar, { id: 'total', header: 'Total a pagar', meta: VALOR, cell: ({ getValue }) => formatoPesos(getValue()) }),
  col.accessor('pagado', { header: 'Pagado', meta: VALOR, cell: ({ getValue }) => formatoPesos(getValue()) }),
  col.accessor((f) => f.d.totalAPagar - f.pagado, {
    id: 'saldo',
    header: 'Saldo',
    meta: { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums font-medium text-slate-900' },
    cell: ({ getValue }) => formatoPesos(getValue()),
  }),
  col.accessor((f) => etiquetaEstadoPago[f.estado], {
    id: 'estado',
    header: 'Estado',
    cell: ({ row: { original: f } }) => <Badge tono={tonoPago[f.estado]}>{etiquetaEstadoPago[f.estado]}</Badge>,
  }),
])

export const ORDEN_INICIAL = [{ id: 'saldo', desc: true }]
