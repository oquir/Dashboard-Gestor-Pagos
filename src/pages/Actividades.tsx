import { AlertTriangle, Document, DocumentDownload, DocumentUpload, Search, TickCircle } from 'reicon-react'
import { useState } from 'react'
import Tabla from '../components/Tabla'
import { Badge, Boton, Card, CardHeader, Input, PageHeader, Select, Vacio } from '../components/ui'
import { etiquetaSector, formatoFecha, normalizar } from '../lib/formato'
import { puede } from '../lib/permisos'
import { descargarPlantilla, leerPlantilla } from '../lib/plantillaActividades'
import { actividadesDe, fueraDeTope } from '../lib/reglas'
import { useSesion } from '../lib/sesion'
import { ayudanteColumnas } from '../lib/tabla'
import { useDatos } from '../store'
import type { Tarifa } from '../types'

const ANIO_EN_CURSO = new Date().getFullYear()
const TITULO = 'Actividades económicas'
const DESCRIPCION = 'Actividades CIIU y tarifas de cada año gravable. El administrador del municipio las carga cada año con la plantilla de Excel.'

const col = ayudanteColumnas<Tarifa>()

const COLUMNAS = col.columns([
  col.accessor('ciiu', { header: 'CIIU', meta: { clase: 'tabular-nums text-slate-500' } }),
  col.accessor('descripcion', { header: 'Actividad', meta: { clase: 'text-slate-900' } }),
  col.accessor((t) => etiquetaSector[t.sector], { id: 'sector', header: 'Sector', meta: { clase: 'text-slate-600' } }),
  col.accessor('porMil', {
    header: 'Tarifa (por mil)',
    meta: { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' },
    cell: ({ row: { original: t } }) => (
      <>
        {t.porMil.toLocaleString('es-CO')}
        {fueraDeTope(t) && (
          <p className="mt-0.5 flex items-center justify-end gap-1 text-xs text-amber-800">
            <AlertTriangle className="size-3" aria-hidden /> Fuera de los topes de ley
          </p>
        )}
      </>
    ),
  }),
])

function Catalogo({ municipioId }: { municipioId: string }) {
  const { usuario } = useSesion()
  const cargas = useDatos((s) => s.actividades)
  const cargarActividades = useDatos((s) => s.cargarActividades)
  const puedeCargar = puede(usuario?.rol, 'cargarActividades')
  const [vigencia, setVigencia] = useState(ANIO_EN_CURSO)
  const [vista, setVista] = useState<{ archivo: string; tarifas: Tarifa[] } | null>(null)
  const [errores, setErrores] = useState<string[]>([])
  const [cargada, setCargada] = useState<string | null>(null)
  const [texto, setTexto] = useState('')

  const delMunicipio = cargas.filter((c) => c.municipioId === municipioId)
  const actual = delMunicipio.find((c) => c.vigencia === vigencia)
  // La plantilla de un año sin cargar trae las del año anterior, para no empezar de cero.
  const base = actividadesDe(cargas, municipioId, vigencia) ?? delMunicipio.toSorted((a, b) => b.vigencia - a.vigencia)[0]
  const vigencias = [...new Set([...delMunicipio.map((c) => c.vigencia), ANIO_EN_CURSO, ANIO_EN_CURSO + 1])].sort((a, b) => b - a)
  const filas = vista?.tarifas ?? actual?.tarifas ?? []
  const fuera = filas.filter(fueraDeTope).length
  const busqueda = normalizar(texto)
  const encontradas = busqueda ? filas.filter((t) => t.ciiu.includes(busqueda) || normalizar(t.descripcion).includes(busqueda)) : filas

  const elegirVigencia = (v: number) => {
    setVigencia(v)
    setVista(null)
    setErrores([])
    setCargada(null)
  }

  const leer = async (archivo: File) => {
    setCargada(null)
    const lectura = await leerPlantilla(archivo)
    setErrores(lectura.errores)
    setVista(lectura.errores.length > 0 ? null : { archivo: archivo.name, tarifas: lectura.tarifas })
  }

  const confirmar = () => {
    if (!vista) return
    cargarActividades(municipioId, vigencia, vista.tarifas, vista.archivo)
    setCargada(`Se cargaron ${vista.tarifas.length} actividades para el año gravable ${vigencia}.`)
    setVista(null)
  }

  return (
    <>
      <PageHeader
        titulo={TITULO}
        descripcion={DESCRIPCION}
        acciones={
          <Select aria-label="Año gravable" value={vigencia} onChange={(e) => elegirVigencia(Number(e.target.value))}>
            {vigencias.map((v) => (
              <option key={v} value={v}>
                Año gravable {v}
                {delMunicipio.some((c) => c.vigencia === v) ? '' : ' (sin cargar)'}
              </option>
            ))}
          </Select>
        }
      />

      <div className="space-y-6">
        {puedeCargar && (
          <Card>
            <CardHeader
              titulo={`Cargar actividades de ${vigencia}`}
              descripcion="Descarga la plantilla, llénala en Excel y cárgala. La carga reemplaza todas las actividades del año gravable."
            />
            <div className="space-y-4 p-5">
              <ol className="grid gap-4 sm:grid-cols-2">
                <li>
                  <p className="mb-1 text-sm font-medium text-slate-700">1. Descarga la plantilla</p>
                  <Boton onClick={() => descargarPlantilla(vigencia, base?.tarifas ?? [])}>
                    <DocumentDownload className="size-4" aria-hidden /> Descargar plantilla
                  </Boton>
                  <p className="mt-1 text-xs text-slate-500">
                    {base
                      ? `Trae las ${base.tarifas.length} actividades de ${base.vigencia} para que ajustes lo que cambió.`
                      : 'Viene vacía, solo con los encabezados.'}
                  </p>
                </li>
                <li>
                  <p className="mb-1 text-sm font-medium text-slate-700">2. Carga el Excel diligenciado</p>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus-within:ring-2 focus-within:ring-brand-500 hover:border-brand-500 hover:text-brand-700">
                    <DocumentUpload className="size-4" aria-hidden /> Elegir archivo .xlsx
                    <input
                      type="file"
                      accept=".xlsx"
                      className="sr-only"
                      onChange={(e) => {
                        const archivo = e.target.files?.[0]
                        e.target.value = ''
                        if (archivo) void leer(archivo)
                      }}
                    />
                  </label>
                </li>
              </ol>

              {errores.length > 0 && (
                <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
                  <p className="font-medium">No se cargó el archivo. Corrígelo y vuelve a cargarlo:</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {errores.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {vista && (
                <div role="status" className="flex flex-wrap items-center gap-3 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
                  <Document className="size-4 shrink-0" aria-hidden />
                  <p className="min-w-0 flex-1">
                    <span className="font-medium">{vista.archivo}</span> trae {vista.tarifas.length} actividades. Revísalas abajo; al confirmar
                    {actual ? ` reemplazan las ${actual.tarifas.length} cargadas` : ' quedan cargadas'} para el año gravable {vigencia}.
                  </p>
                  <div className="flex gap-2">
                    <Boton onClick={() => setVista(null)}>Cancelar</Boton>
                    <Boton variante="primario" onClick={confirmar}>
                      Confirmar carga
                    </Boton>
                  </div>
                </div>
              )}

              {cargada && (
                <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  <TickCircle className="size-4 shrink-0" aria-hidden /> {cargada}
                </p>
              )}
            </div>
          </Card>
        )}

        <Card>
          <CardHeader
            titulo={`Actividades del año gravable ${vigencia}`}
            descripcion={
              vista
                ? `Vista previa de ${vista.archivo}: aún no se ha guardado.`
                : actual && `Cargadas por ${actual.cargadoPor} el ${formatoFecha(actual.fechaCarga)} desde ${actual.archivo}.`
            }
            acciones={
              <div className="flex flex-wrap gap-2">
                {vista && <Badge tono="info">Vista previa</Badge>}
                {fuera > 0 && <Badge tono="alerta">{fuera} fuera de los topes de ley</Badge>}
              </div>
            }
          />
          {filas.length > 0 ? (
            <>
              <div className="border-b border-slate-100 p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <Input
                    type="search"
                    aria-label="Buscar actividad"
                    placeholder="Buscar por nombre de la actividad o código CIIU"
                    className="pl-9"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                  />
                </div>
              </div>
              <Tabla datos={encontradas} columnas={COLUMNAS} idFila={(t) => t.ciiu} densa nombre="actividades" vacio="Ninguna actividad coincide con la búsqueda" />
            </>
          ) : (
            <Vacio
              titulo={`Sin actividades para ${vigencia}`}
              descripcion={puedeCargar ? 'Descarga la plantilla, llénala y cárgala.' : 'El administrador del municipio aún no las ha cargado.'}
            />
          )}
        </Card>
      </div>
    </>
  )
}

export default function Actividades() {
  const { municipioId } = useSesion()
  if (municipioId) return <Catalogo key={municipioId} municipioId={municipioId} />
  return (
    <>
      <PageHeader titulo={TITULO} descripcion={DESCRIPCION} />
      <Card>
        <Vacio titulo="Elige un municipio" descripcion="Selecciona en la barra superior el municipio cuyas actividades quieres ver." />
      </Card>
    </>
  )
}
