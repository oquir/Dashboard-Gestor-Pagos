import { Link } from 'react-router'
import { etiquetaImpuesto, formatoFecha, formatoPesos } from '../../../../lib/formato'
import { ayudanteColumnas } from '../../../../lib/tabla'
import type { FilaPago } from '../../../../types'

const col = ayudanteColumnas<FilaPago>()

export const COLUMNAS = col.columns([
  col.accessor((f) => f.p.fecha, {
    id: 'fecha',
    header: 'Fecha',
    meta: { clase: 'whitespace-nowrap text-slate-700' },
    cell: ({ getValue }) => formatoFecha(getValue()),
  }),
  col.accessor('nombre', { header: 'Declarante', meta: { clase: 'max-w-64 truncate text-slate-900' } }),
  col.accessor((f) => f.d.numero, {
    id: 'declaracion',
    header: 'Declaración',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ row: { original: { d } } }) => (
      <>
        <Link to={`/declaraciones/${d.id}`} className="text-slate-900 hover:text-brand-700">{d.numero}</Link>
        <span className="text-xs text-slate-500"> · {etiquetaImpuesto[d.impuesto]}</span>
      </>
    ),
  }),
  col.accessor((f) => f.d.numeroFactura, {
    id: 'factura',
    header: 'N.º de factura',
    meta: { clase: 'whitespace-nowrap tabular-nums text-slate-700' },
  }),
  col.accessor((f) => f.p.valor, {
    id: 'valor',
    header: 'Valor',
    meta: { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' },
    cell: ({ getValue }) => formatoPesos(getValue()),
  }),
])

export const ORDEN_INICIAL = [{ id: 'fecha', desc: true }]
