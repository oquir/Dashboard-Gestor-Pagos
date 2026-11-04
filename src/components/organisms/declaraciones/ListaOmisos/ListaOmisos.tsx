import { Download, InfoCircle, Warning } from 'reicon-react'
import { useState } from 'react'
import { descargarBlob } from '../../../../lib/archivos'
import { crearXlsx } from '../../../../lib/excel'
import { useSesion } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import { hoy } from '../../../../utils'
import { Boton, Card } from '../../../atoms'
import { Aviso, BarraFiltros, Buscador, CardHeader, Filtro } from '../../../molecules'
import TablaOmisos from '../TablaOmisos'
import { COLUMNAS_EXCEL } from './constants'
import type { ListaOmisosProps } from './types'
import { filaExcel, filtrarOmisos, opcionesAnio, textoDesde, textoSinCalendario, textoSinCeros } from './utils'

/**
 * Los omisos del municipio que se está viendo: avisos de lo que no se pudo revisar, filtros por texto y año gravable,
 * la tabla y la descarga en Excel de lo filtrado.
 */
export default function ListaOmisos({ resultado, impuesto }: ListaOmisosProps) {
  const { municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const [texto, setTexto] = useState('')
  const [anioElegido, setAnio] = useState('')

  const delImpuesto = resultado.omisos.filter((o) => !impuesto || o.impuesto === impuesto)
  const anios = opcionesAnio(delImpuesto)
  // Si el año elegido ya no tiene omisos con el impuesto de la pestaña, se vuelve a "Todo año gravable".
  const anio = anioElegido in anios ? anioElegido : ''
  const filtrados = filtrarOmisos(delImpuesto, texto, anio)
  const nombres = new Map(municipios.map((m) => [m.id, m.nombre]))

  const descargar = () => {
    const libro = crearXlsx({
      nombre: 'Omisos',
      filas: [COLUMNAS_EXCEL.map((c) => c.titulo), ...filtrados.map((o) => filaExcel(o, nombres, hoy()))],
      anchos: COLUMNAS_EXCEL.map((c) => c.ancho),
      // El documento como texto, para que Excel no lo convierta en número.
      columnasTexto: [3],
    })
    descargarBlob(libro, `omisos_${hoy()}.xlsx`)
  }

  return (
    <div className="space-y-4">
      <Aviso tono="info" icono={InfoCircle}>
        {textoDesde(municipios.find((m) => m.id === municipioId))}
      </Aviso>
      {resultado.sinCalendario.length > 0 && (
        <Aviso tono="alerta" icono={Warning} rol="alert">
          {textoSinCalendario(resultado.sinCalendario, nombres, municipioId === null)}
        </Aviso>
      )}
      {resultado.sinCeros > 0 && (!impuesto || impuesto === 'reteica') && (
        <Aviso tono="neutral" icono={InfoCircle}>
          {textoSinCeros(resultado.sinCeros)}
        </Aviso>
      )}

      <Card>
        <CardHeader
          titulo="Omisos"
          descripcion="Inscritos en el RIT que debían declarar un periodo ya vencido y no lo han hecho."
        />
        <BarraFiltros
          buscador={<Buscador placeholder="Buscar por nombre, NIT o cédula, o número de RIT" value={texto} onChange={(e) => setTexto(e.target.value)} />}
          acciones={
            <Boton variante="primario" disabled={filtrados.length === 0} onClick={descargar}>
              <Download className="size-4" aria-hidden /> Descargar Excel
            </Boton>
          }
        >
          <Filtro etiqueta="Año gravable" opciones={anios} valor={anio} cambiar={setAnio} />
        </BarraFiltros>
        <TablaOmisos omisos={filtrados} total={delImpuesto.length} />
      </Card>
    </div>
  )
}
