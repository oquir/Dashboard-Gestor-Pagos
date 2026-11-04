import { useMemo } from 'react'
import { idOmiso } from '../../../../lib/omisos'
import { useSesion } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import Tabla from '../../Tabla'
import { COLUMNAS, ORDEN_INICIAL } from './constants'
import type { TablaOmisosProps } from './types'
import { col, columnaMunicipio } from './utils'

/** Periodos vencidos sin declarar, del más antiguo al más reciente. Cuando 1cero1 mira todos los municipios, agrega la columna de municipio. */
export default function TablaOmisos({ omisos, total }: TablaOmisosProps) {
  const { municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const columnas = useMemo(
    () => (municipioId === null ? col.columns([...COLUMNAS, columnaMunicipio(municipios)]) : COLUMNAS),
    [municipioId, municipios],
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
