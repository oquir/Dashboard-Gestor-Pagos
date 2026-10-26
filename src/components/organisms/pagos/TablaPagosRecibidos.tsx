import { Link } from 'react-router'
import { etiquetaImpuesto, formatoFecha, formatoPesos } from '../../../lib/formato'
import { ayudanteColumnas } from '../../../lib/tabla'
import type { Declaracion, Pago } from '../../../types'
import { Card } from '../../atoms'
import { CardHeader } from '../../molecules'
import Tabla from '../Tabla'

export interface FilaPago {
  p: Pago
  d: Declaracion
  nombre: string
}

const col = ayudanteColumnas<FilaPago>()

const COLUMNAS = col.columns([
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

const ORDEN_INICIAL = [{ id: 'fecha', desc: true }]

/** Pagos recibidos, del más reciente al más antiguo. */
export default function TablaPagosRecibidos({ pagos }: { pagos: FilaPago[] }) {
  return (
    <Card>
      <CardHeader titulo="Pagos recibidos" />
      <Tabla datos={pagos} columnas={COLUMNAS} porPagina={15} ordenInicial={ORDEN_INICIAL} idFila={(f) => f.p.id} nombre="pagos" vacio="No hay pagos registrados" />
    </Card>
  )
}
