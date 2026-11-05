import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Card } from '../../components/atoms'
import { BarraFiltros, Buscador, Filtro, FiltroCasilla, PageHeader, Segmentado } from '../../components/molecules'
import { BuscadorMunicipios, DescargaDeclaraciones, ListaOmisos, SeleccionDeclaraciones, TablaDeclaraciones } from '../../components/organisms'
import { OPCIONES_APROBACION } from '../../constants'
import { presentadaSinCalendario } from '../../lib/calendario'
import { formatoDocumento } from '../../lib/formato'
import { conRit, impuestosVisibles, ritVisible, useAprobacion, useDeclaraciones, useEstadoPago, useOmisos, useSesion } from '../../lib/sesion'
import { useDatos } from '../../store'
import type { EstadoPago, FilaDeclaracion, FiltroAprobacion, Impuesto, TipoDeclaracion, ValorFiltro, VistaDeclaraciones } from '../../types'
import { OPCIONES_PAGO, OPCIONES_TIPO, PESTANAS, VISTAS } from './constants'

export default function Declaraciones() {
  const { municipioId } = useSesion()
  const declaraciones = useDeclaraciones()
  const municipios = useDatos((s) => s.municipios)
  const configuraciones = useDatos((s) => s.configuraciones)
  const estadoDe = useEstadoPago()
  const aprobacion = useAprobacion()
  const omisos = useOmisos()
  // La vista va en la dirección (?vista=omisos) para que Inicio pueda enlazar directo a los omisos.
  const [parametros, setParametros] = useSearchParams()
  const conRitVisible = ritVisible(municipios, municipioId)
  const vista: VistaDeclaraciones = conRitVisible && parametros.get('vista') === 'omisos' ? 'omisos' : 'presentadas'
  const [pestana, setImpuesto] = useState<ValorFiltro<Impuesto>>('')
  const visibles = impuestosVisibles(municipios, municipioId)
  const pestanas = PESTANAS.filter((p) => !p.valor || visibles.includes(p.valor))
  // Si 1cero1 desactiva el impuesto de la pestaña elegida, se vuelve a "Todas".
  const impuesto = pestana && visibles.includes(pestana) ? pestana : ''
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState<ValorFiltro<TipoDeclaracion>>('')
  const [pago, setPago] = useState<ValorFiltro<EstadoPago>>('')
  const [filtroAprobacion, setFiltroAprobacion] = useState<FiltroAprobacion>('')
  const [soloSinCalendario, setSoloSinCalendario] = useState(false)
  const [soloNoInscritos, setSoloNoInscritos] = useState(false)

  const filas = useMemo<FilaDeclaracion[]>(() => {
    const numeros = new Map(declaraciones.map((d) => [d.id, d.numero]))
    const configPorMunicipio = new Map(configuraciones.map((c) => [c.municipioId, c]))
    const enRit = conRit(municipios)
    return declaraciones.map((d) => ({
      d,
      nombre: d.declarante.nombre,
      documento: formatoDocumento(d.declarante),
      pago: estadoDe(d),
      corrige: d.corrigeA && numeros.get(d.corrigeA),
      aprobacion: aprobacion(d),
      sinCalendario: presentadaSinCalendario(d, configPorMunicipio.get(d.municipioId)),
      noInscrito: enRit(d) && !d.inscripcionId,
    }))
  }, [declaraciones, municipios, configuraciones, estadoDe, aprobacion])

  // Columna y filtro de aprobación solo si hay declaraciones con aprobación previa; si no, el filtro elegido no aplica.
  const conAprobacion = filas.some((f) => f.aprobacion)
  const estadoAprobacion = conAprobacion ? filtroAprobacion : ''
  // El filtro solo sale si hay declaraciones presentadas sin el calendario cargado; si no, el elegido no aplica.
  const conSinCalendario = filas.some((f) => f.sinCalendario)
  const filtrarSinCalendario = conSinCalendario && soloSinCalendario
  // Lo mismo con las de quien no está inscrito en el RIT, que solo hay donde un formulario no se valida contra el RIT.
  const conNoInscritos = filas.some((f) => f.noInscrito)
  const filtrarNoInscritos = conNoInscritos && soloNoInscritos

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase()
    return filas.filter(
      ({ d, nombre, documento, pago: p, aprobacion: a, sinCalendario, noInscrito }) =>
        (!impuesto || d.impuesto === impuesto) &&
        (!busqueda ||
          nombre.toLowerCase().includes(busqueda) ||
          documento.toLowerCase().includes(busqueda) ||
          d.numero.toLowerCase().includes(busqueda) ||
          String(d.numeroFactura).includes(busqueda)) &&
        (!tipo || d.tipo === tipo) &&
        (!pago || p === pago) &&
        (!estadoAprobacion || (a?.estado ?? 'no_aplica') === estadoAprobacion) &&
        (!filtrarSinCalendario || sinCalendario) &&
        (!filtrarNoInscritos || noInscrito),
    )
  }, [filas, impuesto, texto, tipo, pago, estadoAprobacion, filtrarSinCalendario, filtrarNoInscritos])

  // La selección sobrevive a los filtros, pero solo cuentan y se descargan las declaraciones que siguen visibles.
  const [seleccion, setSeleccion] = useState<ReadonlySet<string>>(new Set())
  const marcar = useCallback((ids: string[], marcado: boolean) => {
    setSeleccion((actual) => {
      const nueva = new Set(actual)
      for (const id of ids) {
        if (marcado) nueva.add(id)
        else nueva.delete(id)
      }
      return nueva
    })
  }, [setSeleccion])
  const marcadas = filtradas.filter((f) => seleccion.has(f.d.id))

  return (
    <>
      <PageHeader
        titulo="Declaraciones"
        descripcion="ICA anual (formulario único nacional), retención (ReteICA) y autorretención (AutoReteICA). Las de ReteICA y AutoReteICA sin pago total son ineficaces."
      />
      <BuscadorMunicipios />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {conRitVisible && (
          <Segmentado
            etiqueta="Vista"
            className="sm:inline-flex"
            opciones={VISTAS.map((v) => ({ ...v, conteo: v.valor === 'omisos' ? omisos.omisos.length : filas.length }))}
            valor={vista}
            cambiar={(v) => setParametros(v === 'omisos' ? { vista: 'omisos' } : {}, { replace: true })}
          />
        )}
        <Segmentado
          etiqueta="Impuesto"
          className="sm:inline-flex"
          opciones={pestanas.map((p) => ({
            ...p,
            conteo:
              vista === 'omisos'
                ? omisos.omisos.filter((o) => !p.valor || o.impuesto === p.valor).length
                : filas.filter((f) => !p.valor || f.d.impuesto === p.valor).length,
          }))}
          valor={impuesto}
          cambiar={setImpuesto}
        />
      </div>

      {vista === 'omisos' ? (
        <ListaOmisos resultado={omisos} impuesto={impuesto} />
      ) : (
        <Card>
          <BarraFiltros
            buscador={<Buscador placeholder="Buscar por declarante, NIT o cédula, radicado o factura" value={texto} onChange={(e) => setTexto(e.target.value)} />}
            acciones={<DescargaDeclaraciones declaraciones={marcadas.map((f) => f.d)} />}
          >
            <Filtro etiqueta="Tipo de declaración" opciones={OPCIONES_TIPO} valor={tipo} cambiar={setTipo} />
            <Filtro etiqueta="Estado de pago" opciones={OPCIONES_PAGO} valor={pago} cambiar={setPago} />
            {conAprobacion && (
              <Filtro
                etiqueta="Aprobación"
                opciones={OPCIONES_APROBACION}
                valor={estadoAprobacion}
                cambiar={setFiltroAprobacion}
              />
            )}
            {conSinCalendario && <FiltroCasilla etiqueta="Sin calendario cargado" marcado={soloSinCalendario} cambiar={setSoloSinCalendario} />}
            {conNoInscritos && <FiltroCasilla etiqueta="No inscritos en el RIT" marcado={soloNoInscritos} cambiar={setSoloNoInscritos} />}
          </BarraFiltros>

          <SeleccionDeclaraciones declaraciones={marcadas.map((f) => f.d)} quitar={() => setSeleccion(new Set())} />

          <TablaDeclaraciones filas={filtradas} seleccion={seleccion} marcar={marcar} conAprobacion={conAprobacion} />
        </Card>
      )}
    </>
  )
}
