import { useMemo } from 'react'
import { Link } from 'react-router'
import Tabla from '../components/Tabla'
import { Badge, Card, CardHeader, PageHeader, StatTile } from '../components/ui'
import { etiquetaEstadoPago, etiquetaImpuesto, etiquetaPeriodo, formatoCompacto, formatoFecha, formatoPesos } from '../lib/formato'
import { estadoPago, totalPagado } from '../lib/reglas'
import { useDeclaraciones } from '../lib/sesion'
import { ayudanteColumnas } from '../lib/tabla'
import { tonoPago } from '../lib/tonos'
import { useDatos } from '../store'
import type { Declaracion, EstadoPago, Pago } from '../types'

interface FilaCartera {
  d: Declaracion
  estado: EstadoPago
  pagado: number
  nombre: string
}

interface FilaPago {
  p: Pago
  d: Declaracion
  nombre: string
}

const VALOR = { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-700' } as const

const cc = ayudanteColumnas<FilaCartera>()

const COLUMNAS_CARTERA = cc.columns([
  cc.accessor('nombre', { header: 'Declarante', meta: { clase: 'max-w-64 truncate text-slate-900' } }),
  cc.accessor((f) => f.d.numero, {
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
  cc.accessor((f) => f.d.totalAPagar, { id: 'total', header: 'Total a pagar', meta: VALOR, cell: ({ getValue }) => formatoPesos(getValue()) }),
  cc.accessor('pagado', { header: 'Pagado', meta: VALOR, cell: ({ getValue }) => formatoPesos(getValue()) }),
  cc.accessor((f) => f.d.totalAPagar - f.pagado, {
    id: 'saldo',
    header: 'Saldo',
    meta: { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums font-medium text-slate-900' },
    cell: ({ getValue }) => formatoPesos(getValue()),
  }),
  cc.accessor((f) => etiquetaEstadoPago[f.estado], {
    id: 'estado',
    header: 'Estado',
    cell: ({ row: { original: f } }) => <Badge tono={tonoPago[f.estado]}>{etiquetaEstadoPago[f.estado]}</Badge>,
  }),
])

const cp = ayudanteColumnas<FilaPago>()

const COLUMNAS_PAGOS = cp.columns([
  cp.accessor((f) => f.p.fecha, {
    id: 'fecha',
    header: 'Fecha',
    meta: { clase: 'whitespace-nowrap text-slate-700' },
    cell: ({ getValue }) => formatoFecha(getValue()),
  }),
  cp.accessor('nombre', { header: 'Declarante', meta: { clase: 'max-w-64 truncate text-slate-900' } }),
  cp.accessor((f) => f.d.numero, {
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
  cp.accessor((f) => f.p.valor, {
    id: 'valor',
    header: 'Valor',
    meta: { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' },
    cell: ({ getValue }) => formatoPesos(getValue()),
  }),
])

const ORDEN_CARTERA = [{ id: 'saldo', desc: true }]
const ORDEN_PAGOS = [{ id: 'fecha', desc: true }]

export default function Pagos() {
  const declaraciones = useDeclaraciones()
  const inscripciones = useDatos((s) => s.inscripciones)
  const pagos = useDatos((s) => s.pagos)

  const datos = useMemo(() => {
    const porId = new Map(declaraciones.map((d) => [d.id, d]))
    const nombres = new Map(inscripciones.map((i) => [i.id, i.nombre]))
    const reemplazadas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))

    const cartera: FilaCartera[] = declaraciones
      .filter((d) => !reemplazadas.has(d.id))
      .map((d) => ({ d, estado: estadoPago(d, pagos), pagado: totalPagado(d.id, pagos), nombre: nombres.get(d.inscripcionId) ?? '' }))
      .filter((f) => f.estado === 'parcial' || f.estado === 'sin_pago' || f.estado === 'ineficaz')

    const recibidos: FilaPago[] = pagos.flatMap((p) => {
      const d = porId.get(p.declaracionId)
      return d ? [{ p, d, nombre: nombres.get(d.inscripcionId) ?? '' }] : []
    })

    const ineficaces = cartera.filter((f) => f.estado === 'ineficaz')
    return {
      cartera,
      recibidos,
      ineficaces,
      recaudo2026: recibidos.filter((r) => r.p.fecha.startsWith('2026')).reduce((s, r) => s + r.p.valor, 0),
      saldoIca: cartera.filter((f) => f.d.impuesto === 'ica').reduce((s, f) => s + f.d.totalAPagar - f.pagado, 0),
      saldoIneficaces: ineficaces.reduce((s, f) => s + f.d.totalAPagar - f.pagado, 0),
    }
  }, [declaraciones, inscripciones, pagos])

  return (
    <>
      <PageHeader
        titulo="Pagos"
        descripcion="Recaudo y cartera. En el ICA anual el pago puede ser parcial; en retención y autorretención solo el pago total le da efecto a la declaración."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile etiqueta="Recaudado en 2026" valor={`$${formatoCompacto(datos.recaudo2026)}`} detalle={`${datos.recibidos.length} pagos registrados`} />
        <StatTile etiqueta="Saldo pendiente de ICA anual" valor={`$${formatoCompacto(datos.saldoIca)}`} detalle="Pagos parciales y declaraciones sin pago" />
        <StatTile
          etiqueta="Retenciones y autorretenciones ineficaces"
          valor={String(datos.ineficaces.length)}
          detalle={`$${formatoCompacto(datos.saldoIneficaces)} sin pagar`}
        />
      </div>

      <Card className="mt-6">
        <CardHeader titulo="Cartera pendiente" descripcion="Declaraciones vigentes con saldo por pagar." />
        <Tabla
          datos={datos.cartera}
          columnas={COLUMNAS_CARTERA}
          porPagina={10}
          ordenInicial={ORDEN_CARTERA}
          idFila={(f) => f.d.id}
          nombre="declaraciones con saldo"
          vacio="No hay cartera pendiente"
        />
      </Card>

      <Card className="mt-6">
        <CardHeader titulo="Pagos recibidos" />
        <Tabla
          datos={datos.recibidos}
          columnas={COLUMNAS_PAGOS}
          porPagina={15}
          ordenInicial={ORDEN_PAGOS}
          idFila={(f) => f.p.id}
          nombre="pagos"
          vacio="No hay pagos registrados"
        />
      </Card>
    </>
  )
}
