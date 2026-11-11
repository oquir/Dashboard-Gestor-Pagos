import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router'
import { Badge } from '../components/atoms'
import { Vacio } from '../components/molecules'
import { DatosEnviados, PeticionBitacora, RecorridoBitacora } from '../components/organisms'
import { textoResultado } from '../components/organisms/bitacora/TablaBitacora'
import { PlantillaDetalle } from '../components/templates'
import { fueraDeHorario, vecinos } from '../lib/bitacora'
import { formatoFecha, formatoHora } from '../lib/formato'
import { puede } from '../lib/permisos'
import { delMunicipio, useSesion } from '../lib/sesion'
import { useDatos } from '../store'

export default function BitacoraDetalle() {
  const { id } = useParams()
  const { usuario, municipioId } = useSesion()
  const bitacora = useDatos((s) => s.bitacora)
  const municipios = useDatos((s) => s.municipios)
  const numero = Number(id)
  const r = bitacora.find((x) => x.id === numero)

  // Anterior y Siguiente recorren lo mismo que la tabla con el municipio elegido; sin municipio, todos los registros.
  const { anterior, siguiente } = useMemo(
    () => vecinos(delMunicipio(bitacora, municipioId), numero),
    [bitacora, municipioId, numero],
  )
  const ambito = municipios.find((m) => m.id === municipioId)?.nombre ?? 'todos los municipios'

  if (!puede(usuario?.rol, 'verBitacora')) return <Navigate to="/" replace />
  if (!r)
    return (
      <Vacio
        titulo="No se encontró el registro"
        descripcion={`La bitácora no tiene un registro con el número ${id}.`}
      />
    )

  return (
    <PlantillaDetalle
      volver={{ a: '/bitacora', texto: 'Bitácora' }}
      titulo={`Registro N.º ${r.id}`}
      descripcion={`${r.accion} · ${formatoFecha(r.fechaHora.slice(0, 10))}, ${formatoHora(r.fechaHora)}`}
      acciones={
        <>
          <Badge tono={r.exito ? 'exito' : 'peligro'}>{textoResultado(r)}</Badge>
          {fueraDeHorario(r) && <Badge tono="alerta">Fuera de horario</Badge>}
        </>
      }
      aviso={<RecorridoBitacora anterior={anterior} siguiente={siguiente} ambito={ambito} />}
      principal={<DatosEnviados r={r} />}
      lateral={<PeticionBitacora r={r} />}
    />
  )
}
