import { Download, InfoCircle, Warning } from 'reicon-react'
import { useCallback, useMemo, useState } from 'react'
import { descargarBlob } from '../../../../lib/archivos'
import { emplazamientoDelOmiso, situacionEmplazamiento } from '../../../../lib/emplazamientos'
import { crearXlsx } from '../../../../lib/excel'
import { idOmiso } from '../../../../lib/omisos'
import { puede } from '../../../../lib/permisos'
import { useSesion } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import { hoy } from '../../../../utils'
import { Boton, Card } from '../../../atoms'
import { Aviso, BarraFiltros, Buscador, CardHeader, Filtro } from '../../../molecules'
import ModalEmplazamiento from '../ModalEmplazamiento'
import TablaOmisos from '../TablaOmisos'
import { COLUMNAS_EXCEL, OPCIONES_EMPLAZAMIENTO } from './ListaOmisos.constants'
import type { FiltroEmplazamiento, ListaOmisosProps } from './ListaOmisos.types'
import {
  destinatarioDe,
  estadoEmplazamientoDe,
  filaExcel,
  filtrarOmisos,
  opcionesAnio,
  textoDesde,
  textoSinCalendario,
  textoSinCeros,
} from './ListaOmisos.utils'

/**
 * Los omisos del municipio que se está viendo: avisos de lo que no se pudo revisar, filtros por texto, año gravable y
 * emplazamiento, la tabla y la descarga en Excel de lo filtrado. El administrador y el funcionario marcan omisos y los
 * emplazan en lote.
 */
export default function ListaOmisos({ resultado, impuesto }: ListaOmisosProps) {
  const { usuario, municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const emplazamientos = useDatos((s) => s.emplazamientos)
  const declaraciones = useDatos((s) => s.declaraciones)
  const [texto, setTexto] = useState('')
  const [anioElegido, setAnio] = useState('')
  const [filtroEmplazamiento, setFiltroEmplazamiento] = useState<FiltroEmplazamiento>('')
  const [seleccion, setSeleccion] = useState<ReadonlySet<string>>(new Set())
  const [emplazando, setEmplazando] = useState(false)
  const puedeEmplazar = puede(usuario?.rol, 'revisar')
  const fecha = hoy()

  const delImpuesto = resultado.omisos.filter((o) => !impuesto || o.impuesto === impuesto)
  const anios = opcionesAnio(delImpuesto)
  // Si el año elegido ya no tiene omisos con el impuesto de la pestaña, se vuelve a "Todo año gravable".
  const anio = anioElegido in anios ? anioElegido : ''
  const filtrados = filtrarOmisos(delImpuesto, texto, anio).filter(
    (o) =>
      !filtroEmplazamiento ||
      estadoEmplazamientoDe(o, emplazamientos, declaraciones, fecha) === filtroEmplazamiento,
  )
  const nombres = new Map(municipios.map((m) => [m.id, m.nombre]))

  // La selección sobrevive a los filtros, pero solo se emplazan los que siguen visibles y aún no tienen emplazamiento.
  const marcar = useCallback((ids: string[], marcado: boolean) => {
    setSeleccion((actual) => {
      const nueva = new Set(actual)
      for (const id of ids) {
        if (marcado) nueva.add(id)
        else nueva.delete(id)
      }
      return nueva
    })
  }, [])
  const seleccionTabla = useMemo(() => ({ seleccion, marcar }), [seleccion, marcar])
  const marcados = filtrados.filter(
    (o) => seleccion.has(idOmiso(o)) && !emplazamientoDelOmiso(o, emplazamientos),
  )

  const descargar = () => {
    const libro = crearXlsx({
      nombre: 'Omisos',
      filas: [
        COLUMNAS_EXCEL.map((c) => c.titulo),
        ...filtrados.map((o) => {
          const e = emplazamientoDelOmiso(o, emplazamientos)
          return filaExcel(
            o,
            nombres,
            fecha,
            e && { e, estado: situacionEmplazamiento(e, declaraciones, fecha).estado },
          )
        }),
      ],
      anchos: COLUMNAS_EXCEL.map((c) => c.ancho),
      // El documento como texto, para que Excel no lo convierta en número.
      columnasTexto: [3],
    })
    descargarBlob(libro, `omisos_${fecha}.xlsx`)
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
          descripcion={
            puedeEmplazar
              ? 'Inscritos en el RIT que debían declarar un periodo ya vencido y no lo han hecho. Marca los que el municipio emplazó para registrar el emplazamiento.'
              : 'Inscritos en el RIT que debían declarar un periodo ya vencido y no lo han hecho.'
          }
        />
        <BarraFiltros
          buscador={
            <Buscador
              placeholder="Buscar por nombre, NIT o cédula, o número de RIT"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          }
          acciones={
            <Boton variante="primario" disabled={filtrados.length === 0} onClick={descargar}>
              <Download className="size-4" aria-hidden /> Descargar Excel
            </Boton>
          }
        >
          <Filtro etiqueta="Año gravable" opciones={anios} valor={anio} cambiar={setAnio} />
          <Filtro
            etiqueta="Emplazamiento"
            opciones={OPCIONES_EMPLAZAMIENTO}
            valor={filtroEmplazamiento}
            cambiar={setFiltroEmplazamiento}
          />
        </BarraFiltros>
        {puedeEmplazar && marcados.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-brand-100 bg-brand-50 px-4 py-2.5 text-sm">
            <span className="font-medium text-brand-800">
              {marcados.length}{' '}
              {marcados.length === 1 ? 'omiso seleccionado' : 'omisos seleccionados'}
            </span>
            <Boton variante="primario" onClick={() => setEmplazando(true)}>
              Emplazar para declarar
            </Boton>
            <Boton variante="fantasma" onClick={() => setSeleccion(new Set())}>
              Quitar selección
            </Boton>
          </div>
        )}
        <TablaOmisos
          omisos={filtrados}
          total={delImpuesto.length}
          seleccion={puedeEmplazar ? seleccionTabla : undefined}
        />
      </Card>

      {emplazando && (
        <ModalEmplazamiento
          tipo="declarar"
          destinatarios={marcados.map(destinatarioDe)}
          cerrar={() => setEmplazando(false)}
        />
      )}
    </div>
  )
}
