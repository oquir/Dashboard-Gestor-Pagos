import { useMemo } from 'react'
import Tabla from '../../Tabla'
import { COLUMNA_APROBACION, COLUMNAS, ORDEN_INICIAL } from './constants'
import type { TablaDeclaracionesProps } from './types'
import { col, columnaSeleccion } from './utils'

/** Declaraciones filtradas, con casillas para elegirlas. La columna de aprobación va solo si alguna la tiene. */
export default function TablaDeclaraciones({ filas, seleccion, marcar, conAprobacion }: TablaDeclaracionesProps) {
  const columnas = useMemo(
    () => col.columns([columnaSeleccion(filas, seleccion, marcar), ...COLUMNAS, ...(conAprobacion ? [COLUMNA_APROBACION] : [])]),
    [filas, seleccion, marcar, conAprobacion],
  )

  return (
    <Tabla
      datos={filas}
      columnas={columnas}
      porPagina={15}
      ordenInicial={ORDEN_INICIAL}
      idFila={(f) => f.d.id}
      nombre="declaraciones"
      vacio="No hay declaraciones con esos filtros"
    />
  )
}
