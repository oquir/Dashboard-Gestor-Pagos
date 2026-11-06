import { useMemo } from 'react'
import { useDatos } from '../../../../store'
import Tabla from '../../Tabla'
import type { TablaBitacoraProps } from './types'
import { columnasBitacora, ORDEN_INICIAL } from './utils'

/** Los registros de la bitácora, del más reciente al más antiguo. El número abre el registro, con los datos enviados. */
export default function TablaBitacora({ registros, total }: TablaBitacoraProps) {
  const municipios = useDatos((s) => s.municipios)
  const columnas = useMemo(() => columnasBitacora(municipios), [municipios])

  return (
    <Tabla
      datos={registros}
      columnas={columnas}
      porPagina={20}
      ordenInicial={ORDEN_INICIAL}
      idFila={(r) => String(r.id)}
      nombre={`registros (de ${total})`}
      vacio="No hay registros con esos filtros"
    />
  )
}
