import { useMemo } from 'react'
import { useSesion } from '../../../../lib'
import { useDatos } from '../../../../store'
import Tabla from '../../Tabla'
import { COLUMNAS } from './TablaInscripciones.constants'
import type { TablaInscripcionesProps } from './TablaInscripciones.types'
import { col, columnaMunicipio } from './TablaInscripciones.utils'

/** Inscritos en el RIT. Cuando 1cero1 mira todos los municipios, agrega la columna de municipio. */
export default function TablaInscripciones({ inscripciones, total }: TablaInscripcionesProps) {
  const { municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const columnas = useMemo(
    () =>
      municipioId === null ? col.columns([...COLUMNAS, columnaMunicipio(municipios)]) : COLUMNAS,
    [municipioId, municipios],
  )

  return (
    <Tabla
      datos={inscripciones}
      columnas={columnas}
      porPagina={15}
      idFila={(i) => i.id}
      nombre={`inscripciones (de ${total})`}
      vacio="No hay inscripciones con esos filtros"
    />
  )
}
