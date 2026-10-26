import { Download } from 'reicon-react'
import { useMemo, useState } from 'react'
import { Navigate } from 'react-router'
import GraficoBarras from '../components/GraficoBarras'
import type { Barra } from '../components/GraficoBarras'
import Tabla from '../components/Tabla'
import { Boton, Campo, Card, CardHeader, Input, PageHeader, Select } from '../components/ui'
import { descargarBlob } from '../lib/archivos'
import { crearXlsx } from '../lib/excel'
import {
  etiquetaCalidad,
  etiquetaEstadoAprobacion,
  etiquetaEstadoInscripcion,
  etiquetaEstadoPago,
  etiquetaImpuesto,
  etiquetaPeriodo,
  etiquetaTipoDeclaracion,
  etiquetaTipoPersona,
  formatoFecha,
  formatoPesos,
} from '../lib/formato'
import { puede } from '../lib/permisos'
import { estadoPago, sePuedePagar, totalPagado } from '../lib/reglas'
import { conRit, delMunicipio, impuestosVisibles, ritVisible, useAprobacion, useDeclaraciones, useSesion } from '../lib/sesion'
import { ayudanteColumnas } from '../lib/tabla'
import { useDatos } from '../store'
import type { EstadoAprobacion, Impuesto, Inscripcion } from '../types'

const hoy = () => new Date().toISOString().slice(0, 10)
const documento = (i: Inscripcion | undefined) => (i ? `${i.tipoDocumento} ${i.documento}${i.dv ? `-${i.dv}` : ''}` : '')
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const DIA = 24 * 60 * 60 * 1000

/** Mismos colores que las series de la gráfica de recaudo en Inicio. */
const CLASE_IMPUESTO: Record<Impuesto, string> = { ica: 'bg-serie-ica', reteica: 'bg-serie-reteica', autorretencion: 'bg-serie-autorretencion' }

type IdReporte = 'declaraciones' | 'recaudo' | 'cartera' | 'rit'
type Fila = (string | number)[]

interface Columna {
  titulo: string
  /** Ancho en Excel, en caracteres. */
  ancho: number
  formato?: 'pesos' | 'fecha'
}

interface Grafica {
  titulo: string
  descripcion?: string
  formato: 'cantidad' | 'pesos'
  barras: Barra[]
}

const REPORTES: { id: IdReporte; pestana: string; titulo: string; descripcion: string; porFechas: boolean }[] = [
  { id: 'declaraciones', pestana: 'Declaraciones', titulo: 'Declaraciones presentadas', descripcion: 'Declaraciones presentadas en el rango, con su liquidación y su pago.', porFechas: true },
  { id: 'recaudo', pestana: 'Recaudo', titulo: 'Recaudo', descripcion: 'Pagos recibidos en el rango, uno por fila, con la declaración que pagan.', porFechas: true },
  { id: 'cartera', pestana: 'Cartera', titulo: 'Cartera pendiente', descripcion: 'Declaraciones vigentes con saldo por pagar, al día de hoy.', porFechas: false },
  { id: 'rit', pestana: 'RIT', titulo: 'Inscritos en el RIT', descripcion: 'Inscripciones con sus datos de contacto, calidades y actividad principal, al día de hoy.', porFechas: false },
]

const MUNICIPIO: Columna = { titulo: 'Municipio', ancho: 16 }
const RADICADO: Columna = { titulo: 'Radicado', ancho: 18 }
const FACTURA: Columna = { titulo: 'N.º de factura', ancho: 14 }
const IMPUESTO: Columna = { titulo: 'Impuesto', ancho: 13 }
const PERIODO: Columna = { titulo: 'Periodo', ancho: 20 }
const DECLARANTE: Columna = { titulo: 'Declarante', ancho: 36 }
const DOCUMENTO: Columna = { titulo: 'Documento', ancho: 18 }
const VENCIMIENTO: Columna = { titulo: 'Vencimiento', ancho: 13, formato: 'fecha' }
const TOTAL: Columna = { titulo: 'Total a pagar', ancho: 16, formato: 'pesos' }
const PAGADO: Columna = { titulo: 'Pagado', ancho: 16, formato: 'pesos' }
const ESTADO_PAGO: Columna = { titulo: 'Estado de pago', ancho: 24 }
const APROBACION: Columna = { titulo: 'Aprobación', ancho: 26 }

const COLUMNAS: Record<IdReporte, Columna[]> = {
  declaraciones: [
    MUNICIPIO, RADICADO, FACTURA, IMPUESTO, PERIODO, { titulo: 'Tipo', ancho: 12 }, DECLARANTE, DOCUMENTO,
    { titulo: 'Presentación', ancho: 13, formato: 'fecha' }, VENCIMIENTO, TOTAL, PAGADO, ESTADO_PAGO, APROBACION,
  ],
  recaudo: [
    MUNICIPIO, { titulo: 'Fecha de pago', ancho: 13, formato: 'fecha' }, RADICADO, FACTURA, IMPUESTO, PERIODO, DECLARANTE, DOCUMENTO,
    { titulo: 'Medio de pago', ancho: 18 }, { titulo: 'Valor', ancho: 16, formato: 'pesos' },
  ],
  cartera: [
    MUNICIPIO, RADICADO, FACTURA, IMPUESTO, PERIODO, DECLARANTE, DOCUMENTO, VENCIMIENTO, TOTAL, PAGADO,
    { titulo: 'Saldo', ancho: 16, formato: 'pesos' }, ESTADO_PAGO,
  ],
  rit: [
    MUNICIPIO, { titulo: 'N.º de RIT', ancho: 12 }, { titulo: 'Nombre o razón social', ancho: 36 }, DOCUMENTO, { titulo: 'Tipo de persona', ancho: 18 },
    { titulo: 'Estado', ancho: 13 }, { titulo: 'Calidades', ancho: 30 }, { titulo: 'Actividad principal', ancho: 50 }, { titulo: 'Dirección', ancho: 30 },
    { titulo: 'Teléfono', ancho: 14 }, { titulo: 'Correo', ancho: 30 },
  ],
}

const col = ayudanteColumnas<Fila>()

const columnasTabla = (columnas: Columna[]) =>
  col.columns(
    columnas.map((c, i) =>
      col.accessor((f) => f[i], {
        id: String(i),
        header: c.titulo,
        meta:
          c.formato === 'pesos'
            ? { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' }
            : { clase: 'whitespace-nowrap text-slate-700' },
        cell: ({ getValue }) => {
          const valor = getValue()
          if (c.formato === 'pesos') return formatoPesos(Number(valor))
          return c.formato === 'fecha' && valor ? formatoFecha(String(valor)) : valor
        },
      }),
    ),
  )

/** Columnas de la tabla de cada reporte, fijas como pide TanStack Table. */
const TABLAS = Object.fromEntries(Object.entries(COLUMNAS).map(([id, c]) => [id, columnasTabla(c)])) as Record<IdReporte, ReturnType<typeof columnasTabla>>

/** Sin declaraciones con aprobación previa, el reporte de declaraciones va sin esa columna, que es la última. */
const SIN_APROBACION = COLUMNAS.declaraciones.slice(0, -1)
const TABLA_SIN_APROBACION = columnasTabla(SIN_APROBACION)

/** Cuenta o suma por categoría, en el orden de las etiquetas. */
function agrupar<T, K extends string>(items: T[], etiquetas: Record<K, string>, clave: (item: T) => K, valor: (item: T) => number = () => 1): Barra[] {
  return (Object.keys(etiquetas) as K[]).map((k) => ({
    etiqueta: etiquetas[k],
    valor: items.filter((x) => clave(x) === k).reduce((s, x) => s + valor(x), 0),
  }))
}

/** Antigüedad de la deuda según los días desde el vencimiento. */
function antiguedad(vencimiento: string) {
  const dias = Math.floor((Date.parse(hoy()) - Date.parse(vencimiento)) / DIA)
  if (dias <= 0) return 'por_vencer'
  if (dias <= 30) return 'hasta_30'
  if (dias <= 90) return 'hasta_90'
  if (dias <= 180) return 'hasta_180'
  return 'mas_180'
}

const etiquetaAntiguedad: Record<ReturnType<typeof antiguedad>, string> = {
  por_vencer: 'Por vencer',
  hasta_30: 'Vencida hace 1 a 30 días',
  hasta_90: 'Vencida hace 31 a 90 días',
  hasta_180: 'Vencida hace 91 a 180 días',
  mas_180: 'Vencida hace más de 180 días',
}

/** Los estados de pago en que una declaración puede quedar con saldo. */
const ESTADOS_CON_SALDO = { sin_pago: etiquetaEstadoPago.sin_pago, parcial: etiquetaEstadoPago.parcial, ineficaz: etiquetaEstadoPago.ineficaz }

export default function Reportes() {
  const { usuario, municipioId } = useSesion()
  const declaraciones = useDeclaraciones()
  const todasInscripciones = useDatos((s) => s.inscripciones)
  const pagos = useDatos((s) => s.pagos)
  const municipios = useDatos((s) => s.municipios)
  const aprobacion = useAprobacion()
  const [pestana, setPestana] = useState<IdReporte>('declaraciones')
  const [desde, setDesde] = useState(`${hoy().slice(0, 4)}-01-01`)
  const [hasta, setHasta] = useState(hoy)
  const rangoInvalido = !desde || !hasta || desde > hasta
  const [filtroAprobacion, setFiltroAprobacion] = useState<EstadoAprobacion | 'no_aplica' | ''>('')
  // Columna y filtro de aprobación solo si hay declaraciones con aprobación previa; si no, el filtro elegido no aplica.
  const conAprobacion = declaraciones.some((d) => d.aprobacion)
  const estadoAprobacion = conAprobacion ? filtroAprobacion : ''

  // El RIT solo existe donde el municipio lo tiene en el aplicativo.
  const conRitVisible = ritVisible(municipios, municipioId)
  const reportes = REPORTES.filter((r) => r.id !== 'rit' || conRitVisible)
  const reporte = reportes.find((r) => r.id === pestana) ?? reportes[0]

  const datos = useMemo<Record<IdReporte, { filas: Fila[]; graficas: Grafica[] }>>(() => {
    const enRango = (fecha: string) => !rangoInvalido && fecha >= desde && fecha <= hasta
    const inscripciones = delMunicipio(todasInscripciones, municipioId)
    const porId = new Map(inscripciones.map((i) => [i.id, i]))
    const nombreMunicipio = new Map(municipios.map((m) => [m.id, m.nombre]))
    const reemplazadas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))
    const declaracionPorId = new Map(declaraciones.map((d) => [d.id, d]))
    const visibles = impuestosVisibles(municipios, municipioId)
    const porImpuesto = <T,>(items: T[], impuesto: (item: T) => Impuesto, valor: (item: T) => number = () => 1): Barra[] =>
      visibles.map((i) => ({
        etiqueta: etiquetaImpuesto[i],
        valor: items.filter((x) => impuesto(x) === i).reduce((s, x) => s + valor(x), 0),
        clase: CLASE_IMPUESTO[i],
      }))

    const presentadas = declaraciones
      .filter((d) => enRango(d.fechaPresentacion))
      .map((d) => ({ d, ins: porId.get(d.inscripcionId), pagado: totalPagado(d.id, pagos), estado: estadoPago(d, pagos), a: aprobacion(d) }))
      .filter((f) => !estadoAprobacion || (f.a?.estado ?? 'no_aplica') === estadoAprobacion)

    const recibidos = pagos.flatMap((p) => {
      const d = declaracionPorId.get(p.declaracionId)
      return d && enRango(p.fecha) ? [{ p, d, ins: porId.get(d.inscripcionId) }] : []
    })
    const medios = [...new Set(recibidos.map(({ p }) => p.medio))].sort()
    const meses = [...new Set(recibidos.map(({ p }) => p.fecha.slice(0, 7)))].sort()

    const cartera = declaraciones.flatMap((d) => {
      const pagado = totalPagado(d.id, pagos)
      // Lo que aún espera la aprobación previa no se puede pagar: no es cartera.
      if (reemplazadas.has(d.id) || d.totalAPagar <= 0 || pagado >= d.totalAPagar || !sePuedePagar(aprobacion(d))) return []
      return [{ d, ins: porId.get(d.inscripcionId), pagado, saldo: d.totalAPagar - pagado, estado: estadoPago(d, pagos) }]
    })

    const inscritos = inscripciones.filter(conRit(municipios))

    return {
      declaraciones: {
        filas: presentadas.map(({ d, ins, pagado, estado, a }) => [
          nombreMunicipio.get(d.municipioId) ?? '', d.numero, d.numeroFactura, etiquetaImpuesto[d.impuesto], etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo),
          etiquetaTipoDeclaracion[d.tipo], ins?.nombre ?? '', documento(ins), d.fechaPresentacion, d.fechaVencimiento, d.totalAPagar,
          pagado, etiquetaEstadoPago[estado], a ? etiquetaEstadoAprobacion[a.estado] : 'No aplica',
        ]),
        graficas: [
          { titulo: 'Por impuesto', descripcion: 'Cantidad de declaraciones.', formato: 'cantidad', barras: porImpuesto(presentadas, (f) => f.d.impuesto) },
          { titulo: 'Por estado de pago', descripcion: 'Cantidad de declaraciones.', formato: 'cantidad', barras: agrupar(presentadas, etiquetaEstadoPago, (f) => f.estado) },
          { titulo: 'Por tipo de declaración', descripcion: 'Cantidad de declaraciones.', formato: 'cantidad', barras: agrupar(presentadas, etiquetaTipoDeclaracion, (f) => f.d.tipo) },
        ],
      },
      recaudo: {
        filas: recibidos.map(({ p, d, ins }) => [
          nombreMunicipio.get(d.municipioId) ?? '', p.fecha, d.numero, d.numeroFactura, etiquetaImpuesto[d.impuesto],
          etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo), ins?.nombre ?? '', documento(ins), p.medio, p.valor,
        ]),
        graficas: [
          { titulo: 'Por impuesto', descripcion: 'Valor recaudado.', formato: 'pesos', barras: porImpuesto(recibidos, (f) => f.d.impuesto, (f) => f.p.valor) },
          {
            titulo: 'Por medio de pago',
            descripcion: 'Valor recaudado.',
            formato: 'pesos',
            barras: medios.map((m) => ({ etiqueta: m, valor: recibidos.filter((f) => f.p.medio === m).reduce((s, f) => s + f.p.valor, 0) })),
          },
          {
            titulo: 'Por mes',
            descripcion: 'Valor recaudado según la fecha de pago.',
            formato: 'pesos',
            barras: meses.map((m) => ({
              etiqueta: `${MESES[Number(m.slice(5)) - 1]} ${m.slice(0, 4)}`,
              valor: recibidos.filter((f) => f.p.fecha.startsWith(m)).reduce((s, f) => s + f.p.valor, 0),
            })),
          },
        ],
      },
      cartera: {
        filas: cartera.map(({ d, ins, pagado, saldo, estado }) => [
          nombreMunicipio.get(d.municipioId) ?? '', d.numero, d.numeroFactura, etiquetaImpuesto[d.impuesto], etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo),
          ins?.nombre ?? '', documento(ins), d.fechaVencimiento, d.totalAPagar, pagado, saldo, etiquetaEstadoPago[estado],
        ]),
        graficas: [
          { titulo: 'Por impuesto', descripcion: 'Saldo por pagar.', formato: 'pesos', barras: porImpuesto(cartera, (f) => f.d.impuesto, (f) => f.saldo) },
          {
            titulo: 'Por estado de pago',
            descripcion: 'Saldo por pagar.',
            formato: 'pesos',
            barras: agrupar(cartera, ESTADOS_CON_SALDO, (f) => f.estado as keyof typeof ESTADOS_CON_SALDO, (f) => f.saldo),
          },
          { titulo: 'Por antigüedad', descripcion: 'Saldo según los días desde el vencimiento.', formato: 'pesos', barras: agrupar(cartera, etiquetaAntiguedad, (f) => antiguedad(f.d.fechaVencimiento), (f) => f.saldo) },
        ],
      },
      rit: {
        filas: inscritos.map((i) => {
          const principal = i.actividades.find((a) => a.principal)
          return [
            nombreMunicipio.get(i.municipioId) ?? '', i.numeroRit, i.nombre, documento(i), etiquetaTipoPersona[i.tipoPersona], etiquetaEstadoInscripcion[i.estado],
            i.calidades.map((c) => etiquetaCalidad[c.calidad]).join(', '), principal ? `${principal.ciiu} ${principal.descripcion}` : '', i.direccion, i.telefono, i.correo,
          ]
        }),
        graficas: [
          {
            titulo: 'Por calidad',
            descripcion: 'Una inscripción puede tener varias calidades.',
            formato: 'cantidad',
            barras: (Object.keys(etiquetaCalidad) as (keyof typeof etiquetaCalidad)[]).map((c) => ({
              etiqueta: etiquetaCalidad[c],
              valor: inscritos.filter((i) => i.calidades.some((q) => q.calidad === c)).length,
            })),
          },
          { titulo: 'Por estado', descripcion: 'Cantidad de inscripciones.', formato: 'cantidad', barras: agrupar(inscritos, etiquetaEstadoInscripcion, (i) => i.estado) },
          { titulo: 'Por tipo de persona', descripcion: 'Cantidad de inscripciones.', formato: 'cantidad', barras: agrupar(inscritos, etiquetaTipoPersona, (i) => i.tipoPersona) },
        ],
      },
    }
  }, [declaraciones, todasInscripciones, pagos, municipios, municipioId, desde, hasta, rangoInvalido, aprobacion, estadoAprobacion])

  if (!puede(usuario?.rol, 'verReportes')) return <Navigate to="/" replace />

  const { filas, graficas } = datos[reporte.id]
  const sinAprobacion = reporte.id === 'declaraciones' && !conAprobacion
  const definicion = sinAprobacion ? SIN_APROBACION : COLUMNAS[reporte.id]

  const descargar = () => {
    const libro = crearXlsx({
      nombre: reporte.titulo,
      filas: [definicion.map((c) => c.titulo), ...(sinAprobacion ? filas.map((f) => f.slice(0, -1)) : filas)],
      anchos: definicion.map((c) => c.ancho),
      columnasPesos: definicion.flatMap((c, i) => (c.formato === 'pesos' ? [i] : [])),
    })
    descargarBlob(libro, reporte.porFechas ? `reporte_${reporte.id}_${desde}_a_${hasta}.xlsx` : `reporte_${reporte.id}_${hoy()}.xlsx`)
  }

  return (
    <>
      <PageHeader titulo="Reportes" descripcion="Gráficas e informes del municipio. Consulta los datos en la tabla y descárgalos en Excel." />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 sm:inline-flex">
          {reportes.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={reporte.id === r.id}
              onClick={() => setPestana(r.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${reporte.id === r.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {r.pestana}
              <span className="ml-1.5 text-xs text-slate-400">{datos[r.id].filas.length}</span>
            </button>
          ))}
        </div>

        {reporte.porFechas ? (
          <div className="flex flex-wrap items-start gap-3">
            <Campo etiqueta="Desde" error={desde > hasta ? 'Debe ser anterior a la fecha final.' : undefined}>
              <Input type="date" max={hasta || hoy()} value={desde} onChange={(e) => setDesde(e.target.value)} />
            </Campo>
            <Campo etiqueta="Hasta">
              <Input type="date" min={desde} max={hoy()} value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </Campo>
            {reporte.id === 'declaraciones' && conAprobacion && (
              <Campo etiqueta="Aprobación">
                <Select value={estadoAprobacion} onChange={(e) => setFiltroAprobacion(e.target.value as EstadoAprobacion | 'no_aplica' | '')}>
                  <option value="">Toda aprobación</option>
                  {Object.entries(etiquetaEstadoAprobacion).map(([valor, t]) => (
                    <option key={valor} value={valor}>{t}</option>
                  ))}
                  <option value="no_aplica">Sin aprobación previa</option>
                </Select>
              </Campo>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Datos al día de hoy.</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {graficas.map((g) => (
          <GraficoBarras key={g.titulo} titulo={g.titulo} descripcion={g.descripcion} formato={g.formato} barras={g.barras} />
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader
          titulo={reporte.titulo}
          descripcion={reporte.descripcion}
          acciones={
            <Boton variante="primario" disabled={filas.length === 0} onClick={descargar}>
              <Download className="size-4" aria-hidden /> Descargar Excel
            </Boton>
          }
        />
        <Tabla
          key={reporte.id}
          datos={filas}
          columnas={sinAprobacion ? TABLA_SIN_APROBACION : TABLAS[reporte.id]}
          porPagina={10}
          nombre={filas.length === 1 ? 'registro' : 'registros'}
          vacio={reporte.porFechas && rangoInvalido ? 'Corrige el rango de fechas' : 'No hay registros para mostrar'}
        />
      </Card>
    </>
  )
}
