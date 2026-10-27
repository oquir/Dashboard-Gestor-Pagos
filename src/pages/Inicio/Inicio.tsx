import { ClipboardList, Document, AlertTriangle, Wallet } from 'reicon-react'
import { useMemo } from 'react'
import { StatTile } from '../../components/molecules'
import { AprobacionesPendientes, BuscadorMunicipios, ListaDeudas, RecaudoAnual, SolicitudesPendientes } from '../../components/organisms'
import { formatoCompacto } from '../../lib/formato'
import { esperaAprobacion, estadoPago, sePuedePagar, totalPagado } from '../../lib/reglas'
import { aprobacionVisible, conRit, delMunicipio, ritVisible, useAprobacion, useDeclaraciones, useSesion, useVerRecaudo } from '../../lib/sesion'
import { useDatos } from '../../store'
import type { Deuda } from '../../types'
import { ANIO_ACTUAL, COLUMNAS_TARJETAS } from './constants'

export default function Inicio() {
  const { municipioId } = useSesion()
  const todasInscripciones = useDatos((s) => s.inscripciones)
  const declaraciones = useDeclaraciones()
  const municipios = useDatos((s) => s.municipios)
  const pagos = useDatos((s) => s.pagos)
  const aprobacion = useAprobacion()
  const conRitVisible = ritVisible(municipios, municipioId)
  const verRecaudo = useVerRecaudo()

  const datos = useMemo(() => {
    const inscripciones = delMunicipio(todasInscripciones, municipioId)
    // Las solicitudes solo existen donde el RIT está en el aplicativo; los nombres de los declarantes, en todos.
    const enRit = inscripciones.filter(conRit(municipios))
    const porId = new Map(declaraciones.map((d) => [d.id, d]))

    const pendientes = enRit
      .flatMap((ins) => ins.novedades.filter((n) => n.estado === 'pendiente').map((n) => ({ ins, novedad: n })))
      .sort((a, b) => b.novedad.fecha.localeCompare(a.novedad.fecha))

    const recaudo = pagos
      .filter((p) => porId.has(p.declaracionId) && p.fecha.startsWith(String(ANIO_ACTUAL)))
      .reduce((s, p) => s + p.valor, 0)
    // Una declaración corregida se reemplaza por su corrección: se cuenta solo la vigente.
    const reemplazadas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))
    const pagadas = declaraciones.filter((d) => !reemplazadas.has(d.id) && estadoPago(d, pagos) === 'pagada').length

    const deudas: Deuda[] = declaraciones
      .filter((d) => !reemplazadas.has(d.id) && d.totalAPagar > 0 && sePuedePagar(aprobacion(d)))
      .map((d) => ({ d, estado: estadoPago(d, pagos), pagado: totalPagado(d.id, pagos) }))
      .filter((f) => f.pagado < f.d.totalAPagar)
      .sort((a, b) => b.d.fechaPresentacion.localeCompare(a.d.fechaPresentacion))
    const noPagadas = deudas.filter((f) => f.pagado === 0)
    const pagoIncompleto = deudas.filter((f) => f.pagado > 0)
    const saldo = (lista: Deuda[]) => lista.reduce((s, f) => s + f.d.totalAPagar - f.pagado, 0)

    // Lo pendiente va primero, por plazo; lo resuelto, de lo más reciente a lo más antiguo.
    const aprobaciones = declaraciones
      .flatMap((d) => {
        const a = aprobacion(d)
        return a ? [{ d, a }] : []
      })
      .sort((x, y) => {
        const [ex, ey] = [esperaAprobacion(x.a), esperaAprobacion(y.a)]
        if (ex !== ey) return ex ? -1 : 1
        return ex ? x.a.limite.localeCompare(y.a.limite) : (y.a.fecha ?? '').localeCompare(x.a.fecha ?? '')
      })
    const porAprobar = aprobaciones.filter((x) => esperaAprobacion(x.a))

    return {
      pendientes,
      noPagadas,
      pagoIncompleto,
      saldoNoPagadas: saldo(noPagadas),
      saldoPagoIncompleto: saldo(pagoIncompleto),
      recaudo,
      pagadas,
      aprobaciones,
      porAprobar,
      activas: enRit.filter((i) => i.estado === 'activa').length,
      nombres: new Map(inscripciones.map((i) => [i.id, i.nombre])),
    }
  }, [todasInscripciones, declaraciones, pagos, municipios, municipioId, aprobacion])

  // Si 1cero1 apaga la aprobación previa, lo que quedó pendiente se sigue mostrando hasta resolverlo.
  const conAprobacion = aprobacionVisible(municipios, municipioId) || datos.porAprobar.length > 0
  const vencidas = datos.porAprobar.filter((x) => x.a.estado === 'vencida').length
  const tarjetas = 2 + Number(conRitVisible) + Number(conAprobacion) + Number(verRecaudo)
  // Con un número impar de listas, la primera ocupa toda la fila para que las de deuda vayan juntas.
  const primeraAncha = (Number(conRitVisible) + Number(conAprobacion)) % 2 === 1 ? 'lg:col-span-2' : ''

  return (
    <>
      <BuscadorMunicipios />
      <div className={`grid gap-4 sm:grid-cols-2 ${COLUMNAS_TARJETAS[tarjetas]}`}>
        {conRitVisible && (
          <StatTile
            etiqueta="Solicitudes del RIT por revisar"
            valor={String(datos.pendientes.length)}
            icono={<ClipboardList className="size-5" />}
            detalle={`${datos.activas} inscripciones activas`}
          />
        )}
        {conAprobacion && (
          <StatTile
            etiqueta="Declaraciones por aprobar"
            valor={String(datos.porAprobar.length)}
            icono={<Document className="size-5" />}
            detalle={vencidas > 0 ? <span className="text-red-700">{vencidas} con el plazo vencido</span> : 'Dentro del plazo'}
          />
        )}
        {verRecaudo && (
          <StatTile
            etiqueta={`Recaudo ${ANIO_ACTUAL}`}
            valor={`$${formatoCompacto(datos.recaudo)}`}
            icono={<Wallet className="size-5" />}
            detalle={`${datos.pagadas} ${datos.pagadas === 1 ? 'declaración pagada' : 'declaraciones pagadas'}`}
          />
        )}
        <StatTile
          etiqueta="Declaraciones no pagadas"
          valor={String(datos.noPagadas.length)}
          icono={<AlertTriangle className="size-5 text-red-600" />}
          detalle={
            datos.noPagadas.length > 0 ? (
              <span className="text-red-700">${formatoCompacto(datos.saldoNoPagadas)} por pagar</span>
            ) : (
              'Sin alertas'
            )
          }
        />
        <StatTile
          etiqueta="Declaraciones sin pagar el total de la deuda"
          valor={String(datos.pagoIncompleto.length)}
          icono={<AlertTriangle className="size-5 text-amber-600" />}
          detalle={datos.pagoIncompleto.length > 0 ? `$${formatoCompacto(datos.saldoPagoIncompleto)} de saldo pendiente` : 'Sin alertas'}
        />
      </div>

      {verRecaudo && (
        <div className="mt-6">
          <RecaudoAnual anioActual={ANIO_ACTUAL} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {conRitVisible && <SolicitudesPendientes pendientes={datos.pendientes} className={primeraAncha} />}

        {conAprobacion && <AprobacionesPendientes aprobaciones={datos.aprobaciones} nombres={datos.nombres} className={conRitVisible ? '' : primeraAncha} />}

        <ListaDeudas
          titulo="Declaraciones no pagadas"
          descripcion="Tienen valor a pagar y no registran ningún pago. En ReteICA y AutoReteICA son ineficaces."
          vacio="No hay declaraciones sin pagar"
          deudas={datos.noPagadas}
          nombres={datos.nombres}
        />

        <ListaDeudas
          titulo="Declaraciones sin pagar el total de la deuda"
          descripcion="Registran pagos, pero no cubren el total a pagar."
          vacio="No hay declaraciones con pago incompleto"
          deudas={datos.pagoIncompleto}
          nombres={datos.nombres}
        />
      </div>
    </>
  )
}
