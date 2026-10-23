import { ClipboardList, Document, AlertTriangle, Wallet } from 'reicon-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import GraficoRecaudo from '../components/GraficoRecaudo'
import type { FilaRecaudo } from '../components/GraficoRecaudo'
import { Badge, Card, CardHeader, StatTile, Vacio } from '../components/ui'
import { etiquetaEstadoPago, etiquetaImpuesto, etiquetaPeriodo, etiquetaTipoNovedad, formatoCompacto, formatoFecha, formatoPesos } from '../lib/formato'
import { estadoPago, totalPagado } from '../lib/reglas'
import { conRit, delMunicipio, IMPUESTOS, impuestoActivo, impuestosVisibles, ritVisible, useDeclaraciones, useSesion, useVerRecaudo } from '../lib/sesion'
import { tonoPago } from '../lib/tonos'
import { useDatos } from '../store'
import type { Declaracion, EstadoPago } from '../types'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const BIMESTRES = ['Ene–Feb', 'Mar–Abr', 'May–Jun', 'Jul–Ago', 'Sep–Oct', 'Nov–Dic']
const ANIO_ACTUAL = 2026
/** El año en curso y los tres anteriores. */
const ANIOS = [ANIO_ACTUAL, ANIO_ACTUAL - 1, ANIO_ACTUAL - 2, ANIO_ACTUAL - 3]

type Vista = 'bimestral' | 'mensual'
const VISTAS: { valor: Vista; texto: string }[] = [
  { valor: 'bimestral', texto: 'Bimestral' },
  { valor: 'mensual', texto: 'Mensual' },
]

/** Columnas de la fila de indicadores según cuántos hay, para que ninguno quede solo en la segunda fila. */
const COLUMNAS_TARJETAS: Record<number, string> = { 3: 'lg:grid-cols-3', 4: 'xl:grid-cols-4', 5: 'lg:grid-cols-3 xl:grid-cols-5' }

const totalFila = (f: FilaRecaudo) => IMPUESTOS.reduce((s, i) => s + f.valores[i], 0)

function Segmentado<T extends string | number>({ etiqueta, opciones, valor, cambiar }: {
  etiqueta: string
  opciones: { valor: T; texto: string }[]
  valor: T
  cambiar: (valor: T) => void
}) {
  return (
    <div role="group" aria-label={etiqueta} className="flex gap-1 rounded-lg bg-slate-100 p-1">
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={valor === o.valor}
          onClick={() => cambiar(o.valor)}
          className={`rounded-md px-2.5 py-1 text-sm font-medium tabular-nums transition ${valor === o.valor ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  )
}

interface Deuda {
  d: Declaracion
  estado: EstadoPago
  pagado: number
}

/** Declaraciones con deuda: las seis más recientes, con lo que falta por pagar. */
function ListaDeudas({ titulo, descripcion, vacio, deudas, nombres }: {
  titulo: string
  descripcion: string
  vacio: string
  deudas: Deuda[]
  nombres: Map<string, string>
}) {
  return (
    <Card>
      <CardHeader titulo={titulo} descripcion={descripcion} acciones={<Badge tono={deudas.length > 0 ? 'peligro' : 'neutral'}>{deudas.length}</Badge>} />
      {deudas.length === 0 ? (
        <Vacio titulo={vacio} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {deudas.slice(0, 6).map(({ d, estado, pagado }) => (
            <li key={d.id}>
              <Link to={`/declaraciones/${d.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{nombres.get(d.inscripcionId)}</p>
                  <p className="truncate text-xs text-slate-500">
                    {d.numero} · {etiquetaImpuesto[d.impuesto]} · {etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge tono={tonoPago[estado]}>
                    {estado === 'ineficaz' && <AlertTriangle className="size-3" aria-hidden />}
                    {estado === 'ineficaz' ? 'Ineficaz' : etiquetaEstadoPago[estado]}
                  </Badge>
                  <p className="mt-1 text-xs tabular-nums text-slate-700">
                    {pagado > 0 ? `Debe ${formatoPesos(d.totalAPagar - pagado)} de ${formatoPesos(d.totalAPagar)}` : formatoPesos(d.totalAPagar)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default function Inicio() {
  const { municipioId } = useSesion()
  const todasInscripciones = useDatos((s) => s.inscripciones)
  const declaraciones = useDeclaraciones()
  const municipios = useDatos((s) => s.municipios)
  const pagos = useDatos((s) => s.pagos)
  const recaudoHistorico = useDatos((s) => s.recaudoHistorico)
  const [anio, setAnio] = useState(ANIO_ACTUAL)
  const [vista, setVista] = useState<Vista>('bimestral')
  const visibles = useMemo(() => impuestosVisibles(municipios, municipioId), [municipios, municipioId])
  const conRitVisible = ritVisible(municipios, municipioId)
  const verRecaudo = useVerRecaudo()
  const tarjetas = 3 + Number(conRitVisible) + Number(verRecaudo)

  // Recaudo del año elegido, mes a mes: el año en curso sale de los pagos; los anteriores, del histórico.
  const meses = useMemo(() => {
    const filas: FilaRecaudo[] = MESES.map((etiqueta) => ({ etiqueta, valores: { ica: 0, reteica: 0, autorretencion: 0 } }))
    if (anio === ANIO_ACTUAL) {
      const porId = new Map(declaraciones.map((d) => [d.id, d]))
      for (const p of pagos) {
        const d = porId.get(p.declaracionId)
        if (d && p.fecha.startsWith(String(anio))) filas[Number(p.fecha.slice(5, 7)) - 1].valores[d.impuesto] += p.valor
      }
    } else {
      const activo = impuestoActivo(municipios)
      for (const r of delMunicipio(recaudoHistorico, municipioId)) {
        if (r.anio !== anio) continue
        for (const i of IMPUESTOS) if (activo({ municipioId: r.municipioId, impuesto: i })) filas[r.mes - 1].valores[i] += r.valores[i]
      }
    }
    return filas
  }, [anio, declaraciones, pagos, recaudoHistorico, municipios, municipioId])

  const filasGrafico = useMemo(() => {
    const filas =
      vista === 'mensual'
        ? meses
        : BIMESTRES.map((etiqueta, b) => {
            const [a, c] = [meses[b * 2], meses[b * 2 + 1]]
            return { etiqueta, valores: { ica: a.valores.ica + c.valores.ica, reteica: a.valores.reteica + c.valores.reteica, autorretencion: a.valores.autorretencion + c.valores.autorretencion } }
          })
    // En el año en curso la gráfica llega hasta el último periodo con recaudo.
    return anio === ANIO_ACTUAL ? filas.slice(0, filas.findLastIndex((f) => totalFila(f) > 0) + 1) : filas
  }, [meses, vista, anio])

  const datos = useMemo(() => {
    const inscripciones = delMunicipio(todasInscripciones, municipioId)
    // Las solicitudes solo existen donde el RIT está en el aplicativo; los nombres de los declarantes, en todos.
    const enRit = inscripciones.filter(conRit(municipios))
    const porId = new Map(declaraciones.map((d) => [d.id, d]))

    const pendientes = enRit
      .flatMap((ins) => ins.novedades.filter((n) => n.estado === 'pendiente').map((n) => ({ ins, novedad: n })))
      .sort((a, b) => b.novedad.fecha.localeCompare(a.novedad.fecha))

    const recaudo = pagos
      .filter((p) => porId.has(p.declaracionId) && p.fecha.startsWith(String(ANIO_ACTUAL)))
      .reduce((s, p) => s + p.valor, 0)
    // Una declaración corregida se reemplaza por su corrección: se cuenta solo la vigente.
    const reemplazadas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))
    const pagadas = declaraciones.filter((d) => !reemplazadas.has(d.id) && estadoPago(d, pagos) === 'pagada').length

    const deudas: Deuda[] = declaraciones
      .filter((d) => !reemplazadas.has(d.id) && d.totalAPagar > 0)
      .map((d) => ({ d, estado: estadoPago(d, pagos), pagado: totalPagado(d.id, pagos) }))
      .filter((f) => f.pagado < f.d.totalAPagar)
      .sort((a, b) => b.d.fechaPresentacion.localeCompare(a.d.fechaPresentacion))
    const noPagadas = deudas.filter((f) => f.pagado === 0)
    const pagoIncompleto = deudas.filter((f) => f.pagado > 0)
    const saldo = (lista: Deuda[]) => lista.reduce((s, f) => s + f.d.totalAPagar - f.pagado, 0)

    return {
      pendientes,
      noPagadas,
      pagoIncompleto,
      saldoNoPagadas: saldo(noPagadas),
      saldoPagoIncompleto: saldo(pagoIncompleto),
      recaudo,
      pagadas,
      porRevisar: declaraciones.filter((d) => d.estadoRevision === 'pendiente').length,
      activas: enRit.filter((i) => i.estado === 'activa').length,
      nombres: new Map(inscripciones.map((i) => [i.id, i.nombre])),
    }
  }, [todasInscripciones, declaraciones, pagos, municipios, municipioId])

  return (
    <>
      <div className={`grid gap-4 sm:grid-cols-2 ${COLUMNAS_TARJETAS[tarjetas]}`}>
        {conRitVisible && (
          <StatTile
            etiqueta="Solicitudes del RIT por revisar"
            valor={String(datos.pendientes.length)}
            icono={<ClipboardList className="size-5" />}
            detalle={`${datos.activas} inscripciones activas`}
          />
        )}
        <StatTile etiqueta="Declaraciones por revisar" valor={String(datos.porRevisar)} icono={<Document className="size-5" />} />
        {verRecaudo && (
          <StatTile
            etiqueta={`Recaudo ${ANIO_ACTUAL}`}
            valor={`$${formatoCompacto(datos.recaudo)}`}
            icono={<Wallet className="size-5" />}
            detalle={`${datos.pagadas} ${datos.pagadas === 1 ? 'declaración pagada' : 'declaraciones pagadas'}`}
          />
        )}
        <StatTile
          etiqueta="Declaraciones no pagadas"
          valor={String(datos.noPagadas.length)}
          icono={<AlertTriangle className="size-5 text-red-600" />}
          detalle={
            datos.noPagadas.length > 0 ? (
              <span className="text-red-700">${formatoCompacto(datos.saldoNoPagadas)} por pagar</span>
            ) : (
              'Sin alertas'
            )
          }
        />
        <StatTile
          etiqueta="Declaraciones sin pagar el total de la deuda"
          valor={String(datos.pagoIncompleto.length)}
          icono={<AlertTriangle className="size-5 text-amber-600" />}
          detalle={datos.pagoIncompleto.length > 0 ? `$${formatoCompacto(datos.saldoPagoIncompleto)} de saldo pendiente` : 'Sin alertas'}
        />
      </div>

      {verRecaudo && (
        <div className="mt-6">
          <GraficoRecaudo
            titulo={`Recaudo ${anio} por ${vista === 'mensual' ? 'mes' : 'bimestre'}`}
            descripcion="Pagos recibidos según su fecha, por impuesto."
            filas={filasGrafico}
            impuestos={visibles}
            controles={
              <>
                <Segmentado etiqueta="Periodicidad" opciones={VISTAS} valor={vista} cambiar={setVista} />
                <Segmentado etiqueta="Año" opciones={ANIOS.map((a) => ({ valor: a, texto: String(a) }))} valor={anio} cambiar={setAnio} />
              </>
            }
          />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {conRitVisible && (
          <Card>
            <CardHeader titulo="Solicitudes pendientes del RIT" descripcion="Inscripciones, actualizaciones y cancelaciones por revisar." />
            {datos.pendientes.length === 0 ? (
              <Vacio titulo="No hay solicitudes pendientes" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {datos.pendientes.slice(0, 6).map(({ ins, novedad }) => (
                  <li key={novedad.id}>
                    <Link to={`/rit/${ins.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{ins.nombre}</p>
                        <p className="truncate text-xs text-slate-500">{novedad.descripcion}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge tono="alerta">{etiquetaTipoNovedad[novedad.tipo]}</Badge>
                        <p className="mt-1 text-xs text-slate-500">{formatoFecha(novedad.fecha)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        <ListaDeudas
          titulo="Declaraciones no pagadas"
          descripcion="Tienen valor a pagar y no registran ningún pago. En ReteICA y AutoReteICA son ineficaces."
          vacio="No hay declaraciones sin pagar"
          deudas={datos.noPagadas}
          nombres={datos.nombres}
        />

        <ListaDeudas
          titulo="Declaraciones sin pagar el total de la deuda"
          descripcion="Registran pagos, pero no cubren el total a pagar."
          vacio="No hay declaraciones con pago incompleto"
          deudas={datos.pagoIncompleto}
          nombres={datos.nombres}
        />
      </div>
    </>
  )
}
