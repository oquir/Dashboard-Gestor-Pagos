import { Download } from 'reicon-react'
import { descargarBlob } from '../../../lib/archivos'
import { crearXlsx } from '../../../lib/excel'
import { formatoFecha, formatoPesos } from '../../../lib/formato'
import { COLUMNAS, SIN_APROBACION } from '../../../lib/reportes'
import type { Columna, Fila, IdReporte, Reporte } from '../../../lib/reportes'
import { ayudanteColumnas } from '../../../lib/tabla'
import { Boton, Card } from '../../atoms'
import { CardHeader } from '../../molecules'
import Tabla from '../Tabla'

const hoy = () => new Date().toISOString().slice(0, 10)

const col = ayudanteColumnas<Fila>()

const columnasTabla = (columnas: Columna[]) =>
  col.columns(
    columnas.map((c, i) =>
      col.accessor((f) => f[i], {
        id: String(i),
        header: c.titulo,
        meta:
          c.formato === 'pesos'
            ? { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' }
            : { clase: 'whitespace-nowrap text-slate-700' },
        cell: ({ getValue }) => {
          const valor = getValue()
          if (c.formato === 'pesos') return formatoPesos(Number(valor))
          return c.formato === 'fecha' && valor ? formatoFecha(String(valor)) : valor
        },
      }),
    ),
  )

/** Columnas de la tabla de cada reporte, fijas como pide TanStack Table. */
const TABLAS = Object.fromEntries(Object.entries(COLUMNAS).map(([id, c]) => [id, columnasTabla(c)])) as Record<IdReporte, ReturnType<typeof columnasTabla>>
const TABLA_SIN_APROBACION = columnasTabla(SIN_APROBACION)

/** Datos del reporte elegido, paginados, y su descarga en Excel. */
export default function TablaReporte({ reporte, filas, sinAprobacion, desde, hasta, rangoInvalido }: {
  reporte: Reporte
  filas: Fila[]
  /** Sin declaraciones con aprobación previa, el reporte de declaraciones va sin esa columna. */
  sinAprobacion: boolean
  desde: string
  hasta: string
  rangoInvalido: boolean
}) {
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
