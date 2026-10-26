import { Zip, Search } from 'reicon-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router'
import Tabla from '../components/Tabla'
import { Badge, Boton, Card, Input, PageHeader, Select } from '../components/ui'
import {
  etiquetaEstadoAprobacion,
  etiquetaEstadoPago,
  etiquetaImpuesto,
  etiquetaPeriodo,
  etiquetaTipoDeclaracion,
  formatoFecha,
  formatoPesos,
} from '../lib/formato'
import { descargarDeclaracionesZip } from '../lib/pdfDeclaracion'
import { estadoPago } from '../lib/reglas'
import type { SituacionAprobacion } from '../lib/reglas'
import { impuestosVisibles, useAprobacion, useDeclaraciones, useSesion } from '../lib/sesion'
import { ayudanteColumnas } from '../lib/tabla'
import { tonoAprobacion, tonoPago } from '../lib/tonos'
import { useDatos } from '../store'
import type { Declaracion, EstadoPago, Impuesto, TipoDeclaracion } from '../types'

const PESTANAS: { valor: Impuesto | ''; texto: string }[] = [
  { valor: '', texto: 'Todas' },
  { valor: 'ica', texto: 'ICA anual' },
  { valor: 'reteica', texto: 'ReteICA' },
  { valor: 'autorretencion', texto: 'AutoReteICA' },
]

interface Fila {
  d: Declaracion
  nombre: string
  /** NIT o cédula del declarante, con su tipo. */
  documento: string
  pago: EstadoPago
  /** Radicado de la declaración que corrige, si es una corrección. */
  corrige?: string
  aprobacion?: SituacionAprobacion
}

const col = ayudanteColumnas<Fila>()

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
        {(a.estado === 'por_aprobar' || a.estado === 'vencida') && <p className="mt-1 whitespace-nowrap text-xs text-slate-500">Plazo: {formatoFecha(a.limite)}</p>}
      </>
    ) : (
      <span className="text-slate-400">No aplica</span>
    ),
})

/** Casillas para elegir declaraciones; la del encabezado marca todas las filtradas, no solo la página. */
function columnaSeleccion(filas: Fila[], seleccion: ReadonlySet<string>, marcar: (ids: string[], marcado: boolean) => void) {
  const marcadas = filas.filter((f) => seleccion.has(f.d.id)).length
  return col.display({
    id: 'seleccion',
    header: () => (
      <input
        type="checkbox"
        className="size-4 accent-brand-600"
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
      <input
        type="checkbox"
        className="size-4 accent-brand-600"
        aria-label={`Seleccionar la declaración ${d.numero}`}
        checked={seleccion.has(d.id)}
        onChange={(e) => marcar([d.id], e.target.checked)}
      />
    ),
  })
}

const ORDEN_INICIAL = [{ id: 'presentacion', desc: true }]

export default function Declaraciones() {
  const { municipioId } = useSesion()
  const declaraciones = useDeclaraciones()
  const municipios = useDatos((s) => s.municipios)
  const inscripciones = useDatos((s) => s.inscripciones)
  const pagos = useDatos((s) => s.pagos)
  const aprobacion = useAprobacion()
  const [pestana, setImpuesto] = useState<Impuesto | ''>('')
  const visibles = impuestosVisibles(municipios, municipioId)
  const pestanas = PESTANAS.filter((p) => !p.valor || visibles.includes(p.valor))
  // Si 1cero1 desactiva el impuesto de la pestaña elegida, se vuelve a "Todas".
  const impuesto = pestana && visibles.includes(pestana) ? pestana : ''
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState<TipoDeclaracion | ''>('')
  const [pago, setPago] = useState<EstadoPago | ''>('')

  const filas = useMemo<Fila[]>(() => {
    const porId = new Map(inscripciones.map((i) => [i.id, i]))
    const numeros = new Map(declaraciones.map((d) => [d.id, d.numero]))
    return declaraciones.map((d) => {
      const ins = porId.get(d.inscripcionId)
      return {
        d,
        nombre: ins?.nombre ?? '',
        documento: ins ? `${ins.tipoDocumento} ${ins.documento}${ins.dv ? `-${ins.dv}` : ''}` : '',
        pago: estadoPago(d, pagos),
        corrige: d.corrigeA && numeros.get(d.corrigeA),
        aprobacion: aprobacion(d),
      }
    })
  }, [declaraciones, inscripciones, pagos, aprobacion])

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase()
    return filas.filter(
      ({ d, nombre, documento, pago: p }) =>
        (!impuesto || d.impuesto === impuesto) &&
        (!busqueda ||
          nombre.toLowerCase().includes(busqueda) ||
          documento.toLowerCase().includes(busqueda) ||
          d.numero.toLowerCase().includes(busqueda) ||
          String(d.numeroFactura).includes(busqueda)) &&
        (!tipo || d.tipo === tipo) &&
        (!pago || p === pago),
    )
  }, [filas, impuesto, texto, tipo, pago])

  // La selección sobrevive a los filtros, pero solo cuentan y se descargan las declaraciones que siguen visibles.
  const [seleccion, setSeleccion] = useState<ReadonlySet<string>>(new Set())
  const [generando, setGenerando] = useState(false)
  const marcar = useCallback((ids: string[], marcado: boolean) => {
    setSeleccion((actual) => {
      const nueva = new Set(actual)
      for (const id of ids) {
        if (marcado) nueva.add(id)
        else nueva.delete(id)
      }
      return nueva
    })
  }, [setSeleccion])
  const conAprobacion = filas.some((f) => f.aprobacion)
  const columnas = useMemo(
    () => col.columns([columnaSeleccion(filtradas, seleccion, marcar), ...COLUMNAS, ...(conAprobacion ? [COLUMNA_APROBACION] : [])]),
    [filtradas, seleccion, marcar, conAprobacion],
  )
  const marcadas = filtradas.filter((f) => seleccion.has(f.d.id))

  const descargarSeleccion = async () => {
    setGenerando(true)
    try {
      await descargarDeclaracionesZip(
        marcadas.map((f) => f.d),
        useDatos.getState(),
        `declaraciones_${new Date().toISOString().slice(0, 10)}.zip`,
      )
    } finally {
      setGenerando(false)
    }
  }

  return (
    <>
      <PageHeader
        titulo="Declaraciones"
        descripcion="ICA anual (formulario único nacional), retención (ReteICA) y autorretención (AutoReteICA). Las de ReteICA y AutoReteICA sin pago total son ineficaces."
      />

      <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 sm:inline-flex">
        {pestanas.map((p) => (
          <button
            key={p.valor}
            type="button"
            onClick={() => setImpuesto(p.valor)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${impuesto === p.valor ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {p.texto}
            <span className="ml-1.5 text-xs text-slate-400">{filas.filter((f) => !p.valor || f.d.impuesto === p.valor).length}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input placeholder="Buscar por declarante, NIT o cédula, radicado o factura" className="pl-9" value={texto} onChange={(e) => setTexto(e.target.value)} />
          </div>
          <Select aria-label="Tipo de declaración" className="w-auto" value={tipo} onChange={(e) => setTipo(e.target.value as TipoDeclaracion | '')}>
            <option value="">Todo tipo</option>
            {Object.entries(etiquetaTipoDeclaracion).map(([valor, t]) => (
              <option key={valor} value={valor}>{t}</option>
            ))}
          </Select>
          <Select aria-label="Estado de pago" className="w-auto" value={pago} onChange={(e) => setPago(e.target.value as EstadoPago | '')}>
            <option value="">Todo estado de pago</option>
            {Object.entries(etiquetaEstadoPago).map(([valor, t]) => (
              <option key={valor} value={valor}>{t}</option>
            ))}
          </Select>
        </div>

        {marcadas.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-brand-100 bg-brand-50 px-4 py-2.5 text-sm">
            <span className="font-medium text-brand-800">
              {marcadas.length} {marcadas.length === 1 ? 'declaración seleccionada' : 'declaraciones seleccionadas'}
            </span>
            <Boton variante="primario" disabled={generando} onClick={descargarSeleccion}>
              <Zip className="size-4" aria-hidden /> {generando ? 'Generando PDF…' : 'Descargar PDF (.zip)'}
            </Boton>
            <Boton variante="fantasma" disabled={generando} onClick={() => setSeleccion(new Set())}>
              Quitar selección
            </Boton>
          </div>
        )}

        <Tabla
          datos={filtradas}
          columnas={columnas}
          porPagina={15}
          ordenInicial={ORDEN_INICIAL}
          idFila={(f) => f.d.id}
          nombre="declaraciones"
          vacio="No hay declaraciones con esos filtros"
        />
      </Card>
    </>
  )
}
