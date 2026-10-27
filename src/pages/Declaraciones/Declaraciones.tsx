import { useCallback, useMemo, useState } from 'react'
import { Card } from '../../components/atoms'
import { BarraFiltros, Buscador, Filtro, PageHeader, Segmentado } from '../../components/molecules'
import { SeleccionDeclaraciones, TablaDeclaraciones } from '../../components/organisms'
import { OPCIONES_APROBACION } from '../../constants'
import { formatoDocumento } from '../../lib/formato'
import { estadoPago } from '../../lib/reglas'
import { impuestosVisibles, useAprobacion, useDeclaraciones, useSesion } from '../../lib/sesion'
import { useDatos } from '../../store'
import type { EstadoPago, FilaDeclaracion, FiltroAprobacion, Impuesto, TipoDeclaracion, ValorFiltro } from '../../types'
import { OPCIONES_PAGO, OPCIONES_TIPO, PESTANAS } from './constants'

export default function Declaraciones() {
  const { municipioId } = useSesion()
  const declaraciones = useDeclaraciones()
  const municipios = useDatos((s) => s.municipios)
  const inscripciones = useDatos((s) => s.inscripciones)
  const pagos = useDatos((s) => s.pagos)
  const aprobacion = useAprobacion()
  const [pestana, setImpuesto] = useState<ValorFiltro<Impuesto>>('')
  const visibles = impuestosVisibles(municipios, municipioId)
  const pestanas = PESTANAS.filter((p) => !p.valor || visibles.includes(p.valor))
  // Si 1cero1 desactiva el impuesto de la pestaña elegida, se vuelve a "Todas".
  const impuesto = pestana && visibles.includes(pestana) ? pestana : ''
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState<ValorFiltro<TipoDeclaracion>>('')
  const [pago, setPago] = useState<ValorFiltro<EstadoPago>>('')
  const [filtroAprobacion, setFiltroAprobacion] = useState<FiltroAprobacion>('')

  const filas = useMemo<FilaDeclaracion[]>(() => {
    const porId = new Map(inscripciones.map((i) => [i.id, i]))
    const numeros = new Map(declaraciones.map((d) => [d.id, d.numero]))
    return declaraciones.map((d) => {
      const ins = porId.get(d.inscripcionId)
      return {
        d,
        nombre: ins?.nombre ?? '',
        documento: ins ? formatoDocumento(ins) : '',
        pago: estadoPago(d, pagos),
        corrige: d.corrigeA && numeros.get(d.corrigeA),
        aprobacion: aprobacion(d),
      }
    })
  }, [declaraciones, inscripciones, pagos, aprobacion])

  // Columna y filtro de aprobación solo si hay declaraciones con aprobación previa; si no, el filtro elegido no aplica.
  const conAprobacion = filas.some((f) => f.aprobacion)
  const estadoAprobacion = conAprobacion ? filtroAprobacion : ''

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase()
    return filas.filter(
      ({ d, nombre, documento, pago: p, aprobacion: a }) =>
        (!impuesto || d.impuesto === impuesto) &&
        (!busqueda ||
          nombre.toLowerCase().includes(busqueda) ||
          documento.toLowerCase().includes(busqueda) ||
          d.numero.toLowerCase().includes(busqueda) ||
          String(d.numeroFactura).includes(busqueda)) &&
        (!tipo || d.tipo === tipo) &&
        (!pago || p === pago) &&
        (!estadoAprobacion || (a?.estado ?? 'no_aplica') === estadoAprobacion),
    )
  }, [filas, impuesto, texto, tipo, pago, estadoAprobacion])

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

      <Segmentado
        etiqueta="Impuesto"
        className="mb-4 sm:inline-flex"
        opciones={pestanas.map((p) => ({ ...p, conteo: filas.filter((f) => !p.valor || f.d.impuesto === p.valor).length }))}
        valor={impuesto}
        cambiar={setImpuesto}
      />

      <Card>
        <BarraFiltros>
          <Buscador className="min-w-60 flex-1" placeholder="Buscar por declarante, NIT o cédula, radicado o factura" value={texto} onChange={(e) => setTexto(e.target.value)} />
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
        </BarraFiltros>

        <SeleccionDeclaraciones declaraciones={marcadas.map((f) => f.d)} quitar={() => setSeleccion(new Set())} />

        <TablaDeclaraciones filas={filtradas} seleccion={seleccion} marcar={marcar} conAprobacion={conAprobacion} />
      </Card>
    </>
  )
}
