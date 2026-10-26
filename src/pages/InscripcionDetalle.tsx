import { useState } from 'react'
import { useParams } from 'react-router'
import { Badge, Card } from '../components/atoms'
import { Vacio } from '../components/molecules'
import {
  DeclaracionesPresentadas,
  EncabezadoSolicitud,
  FichaCancelacion,
  FichaRit,
  LineaTiempoSolicitudes,
  ListaArchivos,
  RespuestaSolicitud,
} from '../components/organisms'
import { PlantillaDetalle } from '../components/templates'
import { etiquetaEstadoInscripcion } from '../lib/formato'
import { puede } from '../lib/permisos'
import { actividadesDe } from '../lib/reglas'
import { conRit, impuestoActivo, useSesion } from '../lib/sesion'
import { tonoInscripcion } from '../lib/tonos'
import { useDatos } from '../store'

export default function InscripcionDetalle() {
  const { id } = useParams()
  const { usuario } = useSesion()
  const inscripcion = useDatos((s) => s.inscripciones.find((i) => i.id === id))
  const todasDeclaraciones = useDatos((s) => s.declaraciones)
  const configuraciones = useDatos((s) => s.configuraciones)
  const cargasActividades = useDatos((s) => s.actividades)
  const municipios = useDatos((s) => s.municipios)
  /** Solicitud cuyo formulario se está viendo; null = los datos actuales. */
  const [seleccion, setSeleccion] = useState<string | null>(null)

  if (!inscripcion || (usuario?.municipioId && inscripcion.municipioId !== usuario.municipioId)) {
    return <Vacio titulo="No se encontró la inscripción" descripcion="Puede que no exista o que sea de otro municipio." />
  }
  if (!conRit(municipios)(inscripcion)) {
    return <Vacio titulo="El RIT no está en el aplicativo para este municipio" descripcion="1cero1 lo puede activar en Municipios." />
  }

  const config = configuraciones.find((c) => c.municipioId === inscripcion.municipioId)
  const tarifas = actividadesDe(cargasActividades, inscripcion.municipioId, new Date().getFullYear())?.tarifas ?? []
  const declaraciones = todasDeclaraciones
    .filter((d) => d.inscripcionId === inscripcion.id)
    .filter(impuestoActivo(municipios))
    .sort((a, b) => b.fechaPresentacion.localeCompare(a.fechaPresentacion))
  const puedeRevisar = puede(usuario?.rol, 'revisar')
  const solicitud = inscripcion.novedades.find((n) => n.id === seleccion)
  // Se compara con la última solicitud aprobada antes de la elegida.
  const anterior = solicitud && inscripcion.novedades.slice(0, inscripcion.novedades.indexOf(solicitud)).findLast((n) => n.estado === 'aprobada' && n.datos)?.datos
  const soportes = solicitud ? solicitud.soportes : inscripcion.soportes
  const elegir = (novedadId: string | null) => {
    setSeleccion(novedadId)
    // En pantallas angostas la ficha queda arriba de la línea de tiempo.
    const ficha = document.getElementById('ficha')
    if (ficha && ficha.getBoundingClientRect().top < 0) ficha.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <PlantillaDetalle
      volver={{ a: '/rit', texto: 'Inscripciones RIT' }}
      titulo={inscripcion.nombre}
      descripcion={`RIT ${inscripcion.numeroRit} · ${municipios.find((m) => m.id === inscripcion.municipioId)?.nombre}`}
      acciones={<Badge tono={tonoInscripcion[inscripcion.estado]}>{etiquetaEstadoInscripcion[inscripcion.estado]}</Badge>}
      idPrincipal="ficha"
      principal={
        <>
          {solicitud && <EncabezadoSolicitud solicitud={solicitud} comparada={Boolean(anterior)} verActuales={() => elegir(null)} />}
          {solicitud?.cancelacion ? (
            <FichaCancelacion inscripcion={inscripcion} cancelacion={solicitud.cancelacion} />
          ) : (
            <FichaRit datos={solicitud?.datos ?? inscripcion} anterior={anterior} tarifas={solicitud ? undefined : tarifas} />
          )}
          <DeclaracionesPresentadas declaraciones={declaraciones} regimenSimple={inscripcion.regimenSimple} />
        </>
      }
      lateral={
        <>
          <LineaTiempoSolicitudes inscripcion={inscripcion} solicitud={solicitud} elegir={elegir} config={config} puedeRevisar={puedeRevisar} />
          <Card>
            <ListaArchivos
              titulo={solicitud ? 'Soportes de la solicitud' : 'Soportes'}
              descripcion={soportes.length > 0 ? `${soportes.filter((s) => s.archivo).length} de ${soportes.length} cargados` : undefined}
              items={soportes.map((s) => ({ titulo: s.nombre, archivo: s.archivo }))}
              contexto={[`Contribuyente: ${inscripcion.nombre}`, `RIT: ${inscripcion.numeroRit}`]}
              nombreZip={`soportes_RIT_${inscripcion.numeroRit}${solicitud ? `_${solicitud.tipo}_${solicitud.fecha}` : ''}.zip`}
              vacio="El contribuyente no cargó documentos con esta solicitud."
            />
          </Card>
          {puedeRevisar &&
            inscripcion.novedades
              .filter((n) => n.estado === 'pendiente')
              .map((n) => <RespuestaSolicitud key={n.id} inscripcionId={inscripcion.id} novedad={n} correo={inscripcion.correo} />)}
        </>
      }
    />
  )
}
