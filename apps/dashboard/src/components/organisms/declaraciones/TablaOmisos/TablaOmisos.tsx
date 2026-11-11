import { useMemo } from 'react'
import { idOmiso } from '../../../../lib'
import { useSesion } from '../../../../lib'
import { useDatos } from '../../../../store'
import Tabla from '../../Tabla'
import { COLUMNAS, ORDEN_INICIAL } from './TablaOmisos.constants'
import type { TablaOmisosProps } from './TablaOmisos.types'
import { col, columnaEmplazamiento, columnaMunicipio, columnaSeleccion } from './TablaOmisos.utils'

/**
 * Periodos vencidos sin declarar, del más antiguo al más reciente, con su emplazamiento. Quien puede emplazar tiene
 * casillas para elegirlos. Cuando 1cero1 mira todos los municipios, agrega la columna de municipio.
 */
export default function TablaOmisos({ omisos, total, seleccion }: TablaOmisosProps) {
  const { municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const emplazamientos = useDatos((s) => s.emplazamientos)
  const columnas = useMemo(
    () =>
      col.columns([
        ...(seleccion ? [columnaSeleccion(omisos, emplazamientos, seleccion)] : []),
        ...COLUMNAS,
        columnaEmplazamiento(emplazamientos),
        ...(municipioId === null ? [columnaMunicipio(municipios)] : []),
      ]),
    [omisos, emplazamientos, seleccion, municipioId, municipios],
  )

  return (
    <Tabla
      datos={omisos}
      columnas={columnas}
      porPagina={15}
      ordenInicial={ORDEN_INICIAL}
      idFila={idOmiso}
      nombre={`periodos sin declarar (de ${total})`}
      vacio="No hay omisos con esos filtros"
    />
  )
}
