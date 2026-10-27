import { useState } from 'react'
import { formatoFecha, normalizar } from '../../../../lib/formato'
import { fueraDeTope } from '../../../../lib/reglas'
import { Badge, Card } from '../../../atoms'
import { BarraFiltros, Buscador, CardHeader, Vacio } from '../../../molecules'
import Tabla from '../../Tabla'
import { COLUMNAS } from './constants'
import type { TablaActividadesProps } from './types'

/** Actividades y tarifas del año gravable o, mientras no se confirme, las del Excel que se está cargando. */
export default function TablaActividades({ vigencia, actual, vista, puedeCargar }: TablaActividadesProps) {
  const [texto, setTexto] = useState('')
  const filas = vista?.tarifas ?? actual?.tarifas ?? []
  const fuera = filas.filter(fueraDeTope).length
  const busqueda = normalizar(texto)
  const encontradas = busqueda ? filas.filter((t) => t.ciiu.includes(busqueda) || normalizar(t.descripcion).includes(busqueda)) : filas

  return (
    <Card>
      <CardHeader
        titulo={`Actividades del año gravable ${vigencia}`}
        descripcion={
          vista
            ? `Vista previa de ${vista.archivo}: aún no se ha guardado.`
            : actual && `Cargadas por ${actual.cargadoPor} el ${formatoFecha(actual.fechaCarga)} desde ${actual.archivo}.`
        }
        acciones={
          <div className="flex flex-wrap gap-2">
            {vista && <Badge tono="info">Vista previa</Badge>}
            {fuera > 0 && <Badge tono="alerta">{fuera} fuera de los topes de ley</Badge>}
          </div>
        }
      />
      {filas.length > 0 ? (
        <>
          <BarraFiltros>
            <Buscador
              type="search"
              aria-label="Buscar actividad"
              placeholder="Buscar por nombre de la actividad o código CIIU"
              className="flex-1"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </BarraFiltros>
          <Tabla datos={encontradas} columnas={COLUMNAS} idFila={(t) => t.ciiu} densa nombre="actividades" vacio="Ninguna actividad coincide con la búsqueda" />
        </>
      ) : (
        <Vacio
          titulo={`Sin actividades para ${vigencia}`}
          descripcion={puedeCargar ? 'Descarga la plantilla, llénala y cárgala.' : 'El administrador del municipio aún no las ha cargado.'}
        />
      )}
    </Card>
  )
}
