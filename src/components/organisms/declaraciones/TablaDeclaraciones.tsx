import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  etiquetaEstadoAprobacion,
  etiquetaEstadoPago,
  etiquetaImpuesto,
  etiquetaPeriodo,
  etiquetaTipoDeclaracion,
  formatoFecha,
  formatoPesos,
} from '../../../lib/formato'
import { esperaAprobacion } from '../../../lib/reglas'
import type { SituacionAprobacion } from '../../../lib/reglas'
import { ayudanteColumnas } from '../../../lib/tabla'
import { tonoAprobacion, tonoPago } from '../../../lib/tonos'
import type { Declaracion, EstadoPago } from '../../../types'
import { Badge, Casilla } from '../../atoms'
import Tabla from '../Tabla'

export interface FilaDeclaracion {
  d: Declaracion
  nombre: string
  /** NIT o cédula del declarante, con su tipo. */
  documento: string
  pago: EstadoPago
  /** Radicado de la declaración que corrige, si es una corrección. */
  corrige?: string
  aprobacion?: SituacionAprobacion
}

const col = ayudanteColumnas<FilaDeclaracion>()

const COLUMNAS = col.columns([
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
const COLUMNA_APROBACION = col.accessor((f) => (f.aprobacion ? etiquetaEstadoAprobacion[f.aprobacion.estado] : ''), {
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

/** Casillas para elegir declaraciones; la del encabezado marca todas las filtradas, no solo la página. */
function columnaSeleccion(filas: FilaDeclaracion[], seleccion: ReadonlySet<string>, marcar: (ids: string[], marcado: boolean) => void) {
  const marcadas = filas.filter((f) => seleccion.has(f.d.id)).length
  return col.display({
    id: 'seleccion',
    header: () => (
      <Casilla
        aria-label="Seleccionar todas las declaraciones filtradas"
        title={`Seleccionar las ${filas.length} declaraciones filtradas`}
        checked={filas.length > 0 && marcadas === filas.length}
        ref={(el) => {
          if (el) el.indeterminate = marcadas > 0 && marcadas < filas.length
        }}
        onChange={(e) => marcar(filas.map((f) => f.d.id), e.target.checked)}
      />
    ),
    meta: { clase: 'w-10' },
    cell: ({ row: { original: { d } } }) => (
      <Casilla aria-label={`Seleccionar la declaración ${d.numero}`} checked={seleccion.has(d.id)} onChange={(e) => marcar([d.id], e.target.checked)} />
    ),
  })
}

const ORDEN_INICIAL = [{ id: 'presentacion', desc: true }]

/** Declaraciones filtradas, con casillas para elegirlas. La columna de aprobación va solo si alguna la tiene. */
export default function TablaDeclaraciones({ filas, seleccion, marcar, conAprobacion }: {
  filas: FilaDeclaracion[]
  seleccion: ReadonlySet<string>
  marcar: (ids: string[], marcado: boolean) => void
  conAprobacion: boolean
}) {
  const columnas = useMemo(
    () => col.columns([columnaSeleccion(filas, seleccion, marcar), ...COLUMNAS, ...(conAprobacion ? [COLUMNA_APROBACION] : [])]),
    [filas, seleccion, marcar, conAprobacion],
  )

  return (
    <Tabla
      datos={filas}
      columnas={columnas}
      porPagina={15}
      ordenInicial={ORDEN_INICIAL}
      idFila={(f) => f.d.id}
      nombre="declaraciones"
      vacio="No hay declaraciones con esos filtros"
    />
  )
}
