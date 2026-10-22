import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router'
import Tabla from '../components/Tabla'
import { Badge, Card, Input, PageHeader, Select } from '../components/ui'
import { etiquetaCalidad, etiquetaEstadoInscripcion, etiquetaEstadoNovedad, etiquetaTipoNovedad, etiquetaTipoPersona, formatoFecha } from '../lib/formato'
import { conRit, delMunicipio, ritVisible, useSesion } from '../lib/sesion'
import { ayudanteColumnas } from '../lib/tabla'
import { tonoInscripcion } from '../lib/tonos'
import { useDatos } from '../store'
import type { Calidad, EstadoInscripcion, Inscripcion, Municipio, TipoNovedad, TipoPersona } from '../types'

const PLURAL: Record<Calidad, string> = {
  contribuyente: 'Contribuyentes',
  agente_retenedor: 'Agentes retenedores',
  autorretenedor: 'Autorretenedores',
}

/** El trámite más reciente: inscripción, actualización o cancelación del RIT. */
const ultimoTramite = (i: Inscripcion) => i.novedades.reduce((ultimo, n) => (n.fecha >= ultimo.fecha ? n : ultimo))

const col = ayudanteColumnas<Inscripcion>()

const COLUMNAS = col.columns([
  col.accessor('numeroRit', { header: 'RIT', meta: { clase: 'whitespace-nowrap tabular-nums text-slate-600' } }),
  col.accessor('nombre', {
    header: 'Nombre o razón social',
    cell: ({ row: { original: i } }) => (
      <>
        <Link to={`/rit/${i.id}`} className="font-medium text-slate-900 hover:text-brand-700">{i.nombre}</Link>
        <p className="text-xs text-slate-500">
          {i.tipoDocumento} {i.documento}
          {i.dv && `-${i.dv}`}
        </p>
      </>
    ),
  }),
  col.accessor((i) => etiquetaTipoPersona[i.tipoPersona], { id: 'tipoPersona', header: 'Tipo de persona', meta: { clase: 'whitespace-nowrap text-slate-700' } }),
  col.display({
    id: 'calidades',
    header: 'Calidades',
    cell: ({ row: { original: i } }) => (
      <div className="flex flex-wrap gap-1">
        {i.calidades.map((c) => (
          <Badge key={c.calidad} tono={c.calidad === 'contribuyente' ? 'neutral' : 'info'}>{etiquetaCalidad[c.calidad]}</Badge>
        ))}
        {i.regimenSimple && <Badge>SIMPLE</Badge>}
      </div>
    ),
  }),
  col.accessor((i) => etiquetaTipoNovedad[ultimoTramite(i).tipo], {
    id: 'tramite',
    header: 'Tipo de trámite',
    meta: { clase: 'whitespace-nowrap' },
    cell: ({ row: { original: i } }) => {
      const t = ultimoTramite(i)
      return (
        <>
          <p className="text-slate-900">{etiquetaTipoNovedad[t.tipo]}</p>
          <p className={`text-xs ${t.estado === 'pendiente' ? 'font-medium text-amber-700' : 'text-slate-500'}`}>
            {etiquetaEstadoNovedad[t.estado]} · {formatoFecha(t.fecha)}
          </p>
        </>
      )
    },
  }),
  col.accessor((i) => etiquetaEstadoInscripcion[i.estado], {
    id: 'estado',
    header: 'Estado',
    cell: ({ row: { original: i } }) => <Badge tono={tonoInscripcion[i.estado]}>{etiquetaEstadoInscripcion[i.estado]}</Badge>,
  }),
])

const columnaMunicipio = (municipios: Municipio[]) =>
  col.accessor((i) => municipios.find((m) => m.id === i.municipioId)?.nombre ?? '', {
    id: 'municipio',
    header: 'Municipio',
    meta: { clase: 'whitespace-nowrap text-slate-700' },
  })

export default function Inscripciones() {
  const { municipioId } = useSesion()
  const todas = useDatos((s) => s.inscripciones)
  const municipios = useDatos((s) => s.municipios)
  const [texto, setTexto] = useState('')
  const [tipoPersona, setTipoPersona] = useState<TipoPersona | ''>('')
  const [calidad, setCalidad] = useState<Calidad | ''>('')
  const [estado, setEstado] = useState<EstadoInscripcion | ''>('')
  const [tramite, setTramite] = useState<TipoNovedad | ''>('')
  const [soloPendientes, setSoloPendientes] = useState(false)

  const inscripciones = useMemo(() => delMunicipio(todas, municipioId).filter(conRit(municipios)), [todas, municipios, municipioId])
  const columnas = useMemo(
    () => (municipioId === null ? col.columns([...COLUMNAS, columnaMunicipio(municipios)]) : COLUMNAS),
    [municipioId, municipios],
  )

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase()
    return inscripciones.filter(
      (i) =>
        (!busqueda || i.nombre.toLowerCase().includes(busqueda) || i.documento.includes(busqueda) || i.numeroRit.includes(busqueda)) &&
        (!tipoPersona || i.tipoPersona === tipoPersona) &&
        (!calidad || i.calidades.some((c) => c.calidad === calidad)) &&
        (!estado || i.estado === estado) &&
        (!tramite || ultimoTramite(i).tipo === tramite) &&
        (!soloPendientes || i.novedades.some((n) => n.estado === 'pendiente')),
    )
  }, [inscripciones, texto, tipoPersona, calidad, estado, tramite, soloPendientes])

  if (!ritVisible(municipios, municipioId)) return <Navigate to="/" replace />

  const conteo = (c: Calidad) => inscripciones.filter((i) => i.estado === 'activa' && i.calidades.some((q) => q.calidad === c)).length

  return (
    <>
      <PageHeader
        titulo="Inscripciones"
        descripcion="Registro de Información Tributaria: personas naturales, empresas y demás sujetos, con la calidad en que actúan."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {(['contribuyente', 'agente_retenedor', 'autorretenedor'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCalidad(calidad === c ? '' : c)}
            className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${calidad === c ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <p className="text-sm text-slate-500">{PLURAL[c]} activos</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{conteo(c)}</p>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input placeholder="Buscar por nombre, documento o número de RIT" className="pl-9" value={texto} onChange={(e) => setTexto(e.target.value)} />
          </div>
          <Select aria-label="Tipo de persona" className="w-auto" value={tipoPersona} onChange={(e) => setTipoPersona(e.target.value as TipoPersona | '')}>
            <option value="">Todo tipo de persona</option>
            {Object.entries(etiquetaTipoPersona).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </Select>
          <Select aria-label="Calidad" className="w-auto" value={calidad} onChange={(e) => setCalidad(e.target.value as Calidad | '')}>
            <option value="">Toda calidad</option>
            {Object.entries(etiquetaCalidad).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </Select>
          <Select aria-label="Estado" className="w-auto" value={estado} onChange={(e) => setEstado(e.target.value as EstadoInscripcion | '')}>
            <option value="">Todo estado</option>
            {Object.entries(etiquetaEstadoInscripcion).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </Select>
          <Select aria-label="Tipo de trámite" className="w-auto" value={tramite} onChange={(e) => setTramite(e.target.value as TipoNovedad | '')}>
            <option value="">Todo trámite</option>
            {Object.entries(etiquetaTipoNovedad).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </Select>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="size-4 rounded border-slate-300 accent-brand-600" checked={soloPendientes} onChange={(e) => setSoloPendientes(e.target.checked)} />
            Con solicitudes pendientes
          </label>
        </div>

        <Tabla
          datos={filtradas}
          columnas={columnas}
          porPagina={15}
          idFila={(i) => i.id}
          nombre={`inscripciones (de ${inscripciones.length})`}
          vacio="No hay inscripciones con esos filtros"
        />
      </Card>
    </>
  )
}
