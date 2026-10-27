import { useMemo, useState } from 'react'
import { Navigate } from 'react-router'
import { Card, Casilla } from '../../components/atoms'
import { BarraFiltros, Buscador, Filtro, IndicadorSeleccionable, PageHeader } from '../../components/molecules'
import { TablaInscripciones } from '../../components/organisms'
import { ultimoTramite } from '../../lib/reglas'
import { conRit, delMunicipio, ritVisible, useSesion } from '../../lib/sesion'
import { useDatos } from '../../store'
import type { Calidad, EstadoInscripcion, TipoNovedad, TipoPersona, ValorFiltro } from '../../types'
import { CALIDADES, OPCIONES_CALIDAD, OPCIONES_ESTADO, OPCIONES_TIPO_PERSONA, OPCIONES_TRAMITE, PLURAL } from './constants'

export default function Inscripciones() {
  const { municipioId } = useSesion()
  const todas = useDatos((s) => s.inscripciones)
  const municipios = useDatos((s) => s.municipios)
  const [texto, setTexto] = useState('')
  const [tipoPersona, setTipoPersona] = useState<ValorFiltro<TipoPersona>>('')
  const [calidad, setCalidad] = useState<ValorFiltro<Calidad>>('')
  const [estado, setEstado] = useState<ValorFiltro<EstadoInscripcion>>('')
  const [tramite, setTramite] = useState<ValorFiltro<TipoNovedad>>('')
  const [soloPendientes, setSoloPendientes] = useState(false)

  const inscripciones = useMemo(() => delMunicipio(todas, municipioId).filter(conRit(municipios)), [todas, municipios, municipioId])

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
        {CALIDADES.map((c) => (
          <IndicadorSeleccionable key={c} etiqueta={`${PLURAL[c]} activos`} valor={conteo(c)} activo={calidad === c} onClick={() => setCalidad(calidad === c ? '' : c)} />
        ))}
      </div>

      <Card>
        <BarraFiltros>
          <Buscador className="min-w-60 flex-1" placeholder="Buscar por nombre, documento o número de RIT" value={texto} onChange={(e) => setTexto(e.target.value)} />
          <Filtro etiqueta="Tipo de persona" opciones={OPCIONES_TIPO_PERSONA} valor={tipoPersona} cambiar={setTipoPersona} />
          <Filtro etiqueta="Calidad" opciones={OPCIONES_CALIDAD} valor={calidad} cambiar={setCalidad} />
          <Filtro etiqueta="Estado" opciones={OPCIONES_ESTADO} valor={estado} cambiar={setEstado} />
          <Filtro etiqueta="Tipo de trámite" opciones={OPCIONES_TRAMITE} valor={tramite} cambiar={setTramite} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <Casilla className="rounded border-slate-300" checked={soloPendientes} onChange={(e) => setSoloPendientes(e.target.checked)} />
            Con solicitudes pendientes
          </label>
        </BarraFiltros>

        <TablaInscripciones inscripciones={filtradas} total={inscripciones.length} />
      </Card>
    </>
  )
}
