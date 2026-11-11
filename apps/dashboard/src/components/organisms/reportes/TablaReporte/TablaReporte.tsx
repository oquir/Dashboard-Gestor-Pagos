import { Download } from 'reicon-react'
import { descargarBlob } from '../../../../lib/archivos'
import { crearXlsx } from '../../../../lib/excel'
import { COLUMNAS, SIN_APROBACION } from '../../../../lib/reportes'
import { hoy } from '../../../../utils'
import { Boton, Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Tabla from '../../Tabla'
import { TABLA_SIN_APROBACION, TABLAS } from './constants'
import type { TablaReporteProps } from './types'

/** Datos del reporte elegido, paginados, y su descarga en Excel. */
export default function TablaReporte({ reporte, filas, sinAprobacion, desde, hasta, rangoInvalido }: TablaReporteProps) {
  const definicion = sinAprobacion ? SIN_APROBACION : COLUMNAS[reporte.id]

  const descargar = () => {
    const libro = crearXlsx({
      nombre: reporte.titulo,
      filas: [definicion.map((c) => c.titulo), ...(sinAprobacion ? filas.map((f) => f.slice(0, -1)) : filas)],
      anchos: definicion.map((c) => c.ancho),
      columnasPesos: definicion.flatMap((c, i) => (c.formato === 'pesos' ? [i] : [])),
    })
    descargarBlob(libro, reporte.porFechas ? `reporte_${reporte.id}_${desde}_a_${hasta}.xlsx` : `reporte_${reporte.id}_${hoy()}.xlsx`)
  }

  return (
    <Card>
      <CardHeader
        titulo={reporte.titulo}
        descripcion={reporte.descripcion}
        acciones={
          <Boton variante="primario" disabled={filas.length === 0} onClick={descargar}>
            <Download className="size-4" aria-hidden /> Descargar Excel
          </Boton>
        }
      />
      <Tabla
        datos={filas}
        columnas={sinAprobacion ? TABLA_SIN_APROBACION : TABLAS[reporte.id]}
        porPagina={10}
        nombre={filas.length === 1 ? 'registro' : 'registros'}
        vacio={reporte.porFechas && rangoInvalido ? 'Corrige el rango de fechas' : 'No hay registros para mostrar'}
      />
    </Card>
  )
}
