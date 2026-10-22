import { ClipboardList, FileText, TriangleAlert, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import GraficoRecaudo from '../components/GraficoRecaudo'
import type { FilaRecaudo } from '../components/GraficoRecaudo'
import { Badge, Card, CardHeader, StatTile, Vacio } from '../components/ui'
import { etiquetaTipoNovedad, formatoCompacto, formatoFecha, formatoPesos } from '../lib/formato'
import { estadoPago } from '../lib/reglas'
import { conRit, delMunicipio, IMPUESTOS, impuestoActivo, impuestosVisibles, ritVisible, useDeclaraciones, useSesion } from '../lib/sesion'
import { useDatos } from '../store'

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
  const conReteica = visibles.includes('reteica')
  const conRitVisible = ritVisible(municipios, municipioId)

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

    const reteSinPago = declaraciones
      .filter((d) => d.impuesto === 'reteica' && estadoPago(d, pagos) === 'ineficaz')
      .sort((a, b) => b.fechaPresentacion.localeCompare(a.fechaPresentacion))

    const recaudo = pagos
      .filter((p) => porId.has(p.declaracionId) && p.fecha.startsWith(String(ANIO_ACTUAL)))
      .reduce((s, p) => s + p.valor, 0)
    // Una declaración corregida se reemplaza por su corrección: se cuenta solo la vigente.
    const reemplazadas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))
    const pagadas = declaraciones.filter((d) => !reemplazadas.has(d.id) && estadoPago(d, pagos) === 'pagada').length

    return {
      pendientes,
      reteSinPago,
      recaudo,
      pagadas,
      porRevisar: declaraciones.filter((d) => d.estadoRevision === 'pendiente').length,
      activas: enRit.filter((i) => i.estado === 'activa').length,
      porId: new Map(inscripciones.map((i) => [i.id, i])),
    }
  }, [todasInscripciones, declaraciones, pagos, municipios, municipioId])

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {conRitVisible && (
          <StatTile
            etiqueta="Solicitudes del RIT por revisar"
            valor={String(datos.pendientes.length)}
            icono={<ClipboardList className="size-5" />}
            detalle={`${datos.activas} inscripciones activas`}
          />
        )}
        <StatTile etiqueta="Declaraciones por revisar" valor={String(datos.porRevisar)} icono={<FileText className="size-5" />} />
        <StatTile
          etiqueta={`Recaudo ${ANIO_ACTUAL}`}
          valor={`$${formatoCompacto(datos.recaudo)}`}
          icono={<Wallet className="size-5" />}
          detalle={`${datos.pagadas} ${datos.pagadas === 1 ? 'declaración pagada' : 'declaraciones pagadas'}`}
        />
        {conReteica && (
          <StatTile
            etiqueta="ReteICA sin pago total"
            valor={String(datos.reteSinPago.length)}
            icono={<TriangleAlert className="size-5 text-red-600" />}
            detalle={
              datos.reteSinPago.length > 0 ? (
                <span className="flex items-center gap-1 text-red-700">
                  <TriangleAlert className="size-3.5" aria-hidden /> Críticas: declaraciones ineficaces
                </span>
              ) : (
                'Sin alertas'
              )
            }
          />
        )}
      </div>

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

        {conReteica && (
          <Card>
            <CardHeader
              titulo="ReteICA sin pago total"
              descripcion="Sin pago total la declaración es ineficaz, y no consignar lo retenido puede tener consecuencias penales (art. 402 del Código Penal)."
            />
            {datos.reteSinPago.length === 0 ? (
              <Vacio titulo="No hay retenciones sin pagar" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {datos.reteSinPago.slice(0, 6).map((d) => (
                  <li key={d.id}>
                    <Link to={`/declaraciones/${d.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{datos.porId.get(d.inscripcionId)?.nombre}</p>
                        <p className="text-xs text-slate-500">
                          {d.numero} · bimestre {d.periodo} de {d.vigencia}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge tono="peligro">
                          <TriangleAlert className="size-3" aria-hidden /> Ineficaz
                        </Badge>
                        <p className="mt-1 text-xs text-slate-700">{formatoPesos(d.totalAPagar)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </>
  )
}
