import { Link } from 'react-router'
import {
  etiquetaEstadoAprobacion,
  etiquetaEstadoPago,
  etiquetaImpuesto,
  etiquetaPeriodo,
  etiquetaTipoDeclaracion,
  formatoFecha,
  formatoPesos,
} from '../../../../lib/formato'
import { esperaAprobacion } from '../../../../lib/reglas'
import { tonoAprobacion, tonoPago } from '../../../../lib/tonos'
import { Badge } from '../../../atoms'
import { col } from './utils'

export const COLUMNAS = col.columns([
  col.accessor((f) => f.d.numero, {
    id: 'numero',
    header: 'Radicado',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ row: { original: { d } } }) => (
      <Link to={`/declaraciones/${d.id}`} className="font-medium tabular-nums text-slate-900 hover:text-brand-700">{d.numero}</Link>
    ),
  }),
  col.accessor((f) => f.d.numeroFactura, {
    id: 'factura',
    header: 'N.º de factura',
    meta: { clase: 'whitespace-nowrap tabular-nums text-slate-700' },
  }),
  col.accessor((f) => etiquetaTipoDeclaracion[f.d.tipo], {
    id: 'tipo',
    header: 'Tipo de declaración',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ row: { original: { d, corrige } } }) => (
      <>
        <p className="text-slate-900">{etiquetaTipoDeclaracion[d.tipo]}</p>
        {corrige && <p className="text-xs tabular-nums text-slate-500">Corrige la {corrige}</p>}
        {d.fechaCierre && <p className="text-xs text-slate-500">Cierre: {formatoFecha(d.fechaCierre)}</p>}
      </>
    ),
  }),
  col.accessor('nombre', {
    header: 'Declarante',
    meta: { clase: 'max-w-64' },
    cell: ({ row: { original: f } }) => (
      <>
        <p className="truncate text-slate-700">{f.nombre}</p>
        <p className="truncate text-xs tabular-nums text-slate-500">{f.documento}</p>
      </>
    ),
  }),
  col.accessor((f) => `${f.d.impuesto}-${f.d.vigencia}-${f.d.periodo}`, {
    id: 'periodo',
    header: 'Impuesto y periodo',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ row: { original: { d } } }) => (
      <>
        <p className="text-slate-900">{etiquetaImpuesto[d.impuesto]}</p>
        <p className="text-xs text-slate-500">{etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo)}</p>
      </>
    ),
  }),
  col.accessor((f) => f.d.fechaPresentacion, {
    id: 'presentacion',
    header: 'Presentación',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ row: { original: { d } } }) => (
      <>
        <p className="text-slate-700">{formatoFecha(d.fechaPresentacion)}</p>
        {d.tipo !== 'clausura' && d.fechaPresentacion > d.fechaVencimiento && <p className="text-xs text-amber-700">Extemporánea</p>}
      </>
    ),
  }),
  col.accessor((f) => f.d.totalAPagar, {
    id: 'total',
    header: 'Total a pagar',
    meta: { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' },
    cell: ({ getValue }) => formatoPesos(getValue()),
  }),
  col.accessor((f) => etiquetaEstadoPago[f.pago], {
    id: 'pago',
    header: 'Pago',
    cell: ({ row: { original: f } }) => <Badge tono={tonoPago[f.pago]}>{etiquetaEstadoPago[f.pago]}</Badge>,
  }),
])

/** Solo cuando hay declaraciones con aprobación previa; mientras está pendiente, muestra el plazo. */
export const COLUMNA_APROBACION = col.accessor((f) => (f.aprobacion ? etiquetaEstadoAprobacion[f.aprobacion.estado] : ''), {
  id: 'aprobacion',
  header: 'Aprobación',
  cell: ({ row: { original: { aprobacion: a } } }) =>
    a ? (
      <>
        <Badge tono={tonoAprobacion[a.estado]}>{etiquetaEstadoAprobacion[a.estado]}</Badge>
        {esperaAprobacion(a) && <p className="mt-1 whitespace-nowrap text-xs text-slate-500">Plazo: {formatoFecha(a.limite)}</p>}
      </>
    ) : (
      <span className="text-slate-400">No aplica</span>
    ),
})

export const ORDEN_INICIAL = [{ id: 'presentacion', desc: true }]
