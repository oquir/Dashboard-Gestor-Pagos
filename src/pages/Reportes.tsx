import { useMemo, useState } from 'react'
import { Navigate } from 'react-router'
import { Campo, Filtro, PageHeader, RangoFechas, Segmentado } from '../components/molecules'
import { GraficoBarras, TablaReporte } from '../components/organisms'
import { etiquetaEstadoAprobacion } from '../lib/formato'
import { puede } from '../lib/permisos'
import { armarReportes, REPORTES } from '../lib/reportes'
import type { IdReporte } from '../lib/reportes'
import { ritVisible, useAprobacion, useDeclaraciones, useSesion } from '../lib/sesion'
import { useDatos } from '../store'
import type { EstadoAprobacion } from '../types'

const hoy = () => new Date().toISOString().slice(0, 10)

export default function Reportes() {
  const { usuario, municipioId } = useSesion()
  const declaraciones = useDeclaraciones()
  const inscripciones = useDatos((s) => s.inscripciones)
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

  const datos = useMemo(
    () => armarReportes({ declaraciones, inscripciones, pagos, municipios, municipioId, desde, hasta, rangoInvalido, aprobacion, estadoAprobacion }),
    [declaraciones, inscripciones, pagos, municipios, municipioId, desde, hasta, rangoInvalido, aprobacion, estadoAprobacion],
  )

  if (!puede(usuario?.rol, 'verReportes')) return <Navigate to="/" replace />

  const { filas, graficas } = datos[reporte.id]

  return (
    <>
      <PageHeader titulo="Reportes" descripcion="Gráficas e informes del municipio. Consulta los datos en la tabla y descárgalos en Excel." />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <Segmentado
          etiqueta="Reporte"
          className="sm:inline-flex"
          opciones={reportes.map((r) => ({ valor: r.id, texto: r.pestana, conteo: datos[r.id].filas.length }))}
          valor={reporte.id}
          cambiar={setPestana}
        />

        {reporte.porFechas ? (
          <div className="flex flex-wrap items-start gap-3">
            <RangoFechas desde={desde} hasta={hasta} cambiarDesde={setDesde} cambiarHasta={setHasta} />
            {reporte.id === 'declaraciones' && conAprobacion && (
              <Campo etiqueta="Aprobación">
                <Filtro
                  etiqueta="Aprobación"
                  opciones={{ '': 'Toda aprobación', ...etiquetaEstadoAprobacion, no_aplica: 'Sin aprobación previa' }}
                  valor={estadoAprobacion}
                  cambiar={setFiltroAprobacion}
                />
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

      <div className="mt-6">
        <TablaReporte
          key={reporte.id}
          reporte={reporte}
          filas={filas}
          sinAprobacion={reporte.id === 'declaraciones' && !conAprobacion}
          desde={desde}
          hasta={hasta}
          rangoInvalido={rangoInvalido}
        />
      </div>
    </>
  )
}
