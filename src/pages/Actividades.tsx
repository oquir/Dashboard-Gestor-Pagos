import { useState } from 'react'
import { Select } from '../components/atoms'
import { ElegirMunicipio, PageHeader } from '../components/molecules'
import { CatalogoActividades } from '../components/organisms'
import { ANIO_EN_CURSO } from '../constants'
import { useSesion } from '../lib/sesion'
import { useDatos } from '../store'

export default function Actividades() {
  const { municipioId } = useSesion()
  const cargas = useDatos((s) => s.actividades)
  const [elegida, setElegida] = useState(ANIO_EN_CURSO)
  const cargadas = cargas.filter((c) => c.municipioId === municipioId).map((c) => c.vigencia)
  const vigencias = [...new Set([...cargadas, ANIO_EN_CURSO, ANIO_EN_CURSO + 1])].sort((a, b) => b - a)
  // Si el municipio que se elige no tiene ese año, se vuelve al año en curso.
  const vigencia = vigencias.includes(elegida) ? elegida : ANIO_EN_CURSO

  return (
    <>
      <PageHeader
        titulo="Actividades económicas"
        descripcion="Actividades CIIU y tarifas de cada año gravable. El administrador del municipio las carga cada año con la plantilla de Excel."
        acciones={
          municipioId && (
            <Select aria-label="Año gravable" value={vigencia} onChange={(e) => setElegida(Number(e.target.value))}>
              {vigencias.map((v) => (
                <option key={v} value={v}>
                  Año gravable {v}
                  {cargadas.includes(v) ? '' : ' (sin cargar)'}
                </option>
              ))}
            </Select>
          )
        }
      />
      {municipioId ? (
        // Al cambiar de municipio o de año se descartan la vista previa y los mensajes de la carga.
        <CatalogoActividades key={`${municipioId}-${vigencia}`} municipioId={municipioId} vigencia={vigencia} />
      ) : (
        <ElegirMunicipio descripcion="Selecciona en la barra superior el municipio cuyas actividades quieres ver." />
      )}
    </>
  )
}
