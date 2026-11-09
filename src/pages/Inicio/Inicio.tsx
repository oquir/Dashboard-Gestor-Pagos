import { ClipboardList, Document, AlertTriangle, ReceiptMinus, UserSearch, Wallet } from 'reicon-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { StatTile } from '../../components/molecules'
import { AlertaCalendario, AlertaSinConsignar, AprobacionesPendientes, BuscadorMunicipios, ListaDeudas, ProximosVencimientos, RecaudoAnual, SolicitudesPendientes } from '../../components/organisms'
import { formatoCompacto, formatoFecha } from '../../lib/formato'
import { puede } from '../../lib/permisos'
import { correccionPorResolver, correccionVigente, esperaAprobacion, reemplazadas, sePuedePagar, totalPagado } from '../../lib/reglas'
import {
  aprobacionVisible,
  conRit,
  delMunicipio,
  ritVisible,
  solicitudCorreccionVisible,
  useAprobacion,
  useDeclaraciones,
  useEstadoPago,
  useOmisos,
  useSesion,
  useSinCalendario,
  useSinConsignar,
  useSolicitudCorreccion,
  useVerRecaudo,
} from '../../lib/sesion'
import { useDatos } from '../../store'
import type { Deuda } from '../../types'
import { diferenciaDias, hoy } from '../../utils'
import { ANIO_ACTUAL, COLUMNAS_TARJETAS } from './constants'

export default function Inicio() {
  const { usuario, municipioId } = useSesion()
  const todasInscripciones = useDatos((s) => s.inscripciones)
  const declaraciones = useDeclaraciones()
  const municipios = useDatos((s) => s.municipios)
  const configuraciones = useDatos((s) => s.configuraciones)
  const pagos = useDatos((s) => s.pagos)
  const aprobacion = useAprobacion()
  const correccion = useSolicitudCorreccion()
  const estadoDe = useEstadoPago()
  const sinConsignar = useSinConsignar()
  const sinCalendario = useSinCalendario()
  const conRitVisible = ritVisible(municipios, municipioId)
  const verRecaudo = useVerRecaudo()
  const { omisos } = useOmisos()
  const contribuyentesOmisos = new Set(omisos.map((o) => o.inscripcion.id)).size

  const datos = useMemo(() => {
    const inscripciones = delMunicipio(todasInscripciones, municipioId)
    // Las solicitudes solo existen donde el RIT está en el aplicativo.
    const enRit = inscripciones.filter(conRit(municipios))
    const porId = new Map(declaraciones.map((d) => [d.id, d]))

    const pendientes = enRit
      .flatMap((ins) => ins.novedades.filter((n) => n.estado === 'pendiente').map((n) => ({ ins, novedad: n })))
      .sort((a, b) => b.novedad.fecha.localeCompare(a.novedad.fecha))

    const recaudo = pagos
      .filter((p) => porId.has(p.declaracionId) && p.fecha.startsWith(String(ANIO_ACTUAL)))
      .reduce((s, p) => s + p.valor, 0)
    // Una declaración corregida se reemplaza por su corrección: se cuenta solo la vigente. La solicitud de corrección que
    // no se ha aceptado no cuenta: sigue vigente la que corrige.
    const fuera = reemplazadas(declaraciones, correccion)
    const vigentes = declaraciones.filter((d) => !fuera.has(d.id) && correccionVigente(correccion(d)))
    const pagadas = vigentes.filter((d) => estadoDe(d) === 'pagada').length

    const deudas: Deuda[] = vigentes
      .filter((d) => d.totalAPagar > 0 && sePuedePagar(aprobacion(d)))
      .map((d) => ({ d, estado: estadoDe(d), pagado: totalPagado(d.id, pagos) }))
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

    // Las solicitudes de corrección a la baja por resolver, de la que vence primero a la última.
    const correccionesPorResolver = declaraciones
      .flatMap((d) => {
        const c = correccion(d)
        return c && correccionPorResolver(c) ? [{ d, c }] : []
      })
      .sort((x, y) => x.c.limite.localeCompare(y.c.limite))

    return {
      pendientes,
      correccionesPorResolver,
      noPagadas,
      pagoIncompleto,
      saldoNoPagadas: saldo(noPagadas),
      saldoPagoIncompleto: saldo(pagoIncompleto),
      recaudo,
      pagadas,
      aprobaciones,
      porAprobar,
      activas: enRit.filter((i) => i.estado === 'activa').length,
    }
  }, [todasInscripciones, declaraciones, pagos, municipios, municipioId, aprobacion, correccion, estadoDe])

  // Si 1cero1 apaga la aprobación previa, lo que quedó pendiente se sigue mostrando hasta resolverlo.
  const conAprobacion = aprobacionVisible(municipios, municipioId) || datos.porAprobar.length > 0
  const vencidas = datos.porAprobar.filter((x) => x.a.estado === 'vencida').length
  // Igual con las solicitudes de corrección a la baja: si el municipio cambia de trámite, las que quedaron se siguen mostrando.
  const conCorrecciones = solicitudCorreccionVisible(configuraciones, municipioId) || datos.correccionesPorResolver.length > 0
  const primeraCorreccion = datos.correccionesPorResolver[0]
  // Si al municipio se le acaba el plazo, se acepta sola: se avisa en ámbar desde 15 días antes.
  const correccionPronto = primeraCorreccion && diferenciaDias(hoy(), primeraCorreccion.c.limite) <= 15
  // Con el RIT van dos tarjetas: las solicitudes por revisar y los omisos.
  const tarjetas = 2 + 2 * Number(conRitVisible) + Number(conAprobacion) + Number(conCorrecciones) + Number(verRecaudo)
  // Con un número impar de listas, la primera ocupa toda la fila para que las de deuda vayan juntas.
  const primeraAncha = (1 + Number(conRitVisible) + Number(conAprobacion)) % 2 === 1 ? 'lg:col-span-2' : ''

  return (
    <>
      <BuscadorMunicipios />
      <AlertaCalendario anio={sinCalendario.anio} municipios={sinCalendario.municipios} className="mb-6" />
      {puede(usuario?.rol, 'verAlertaSinConsignar') && <AlertaSinConsignar retenciones={sinConsignar} className="mb-6" />}
      <div className={`grid gap-4 sm:grid-cols-2 ${COLUMNAS_TARJETAS[tarjetas]}`}>
        {conRitVisible && (
          <StatTile
            etiqueta="Solicitudes del RIT por revisar"
            valor={String(datos.pendientes.length)}
            icono={<ClipboardList className="size-5" />}
            detalle={`${datos.activas} inscripciones activas`}
          />
        )}
        {conRitVisible && (
          <StatTile
            etiqueta="Contribuyentes omisos"
            valor={String(contribuyentesOmisos)}
            icono={<UserSearch className="size-5" />}
            detalle={
              omisos.length > 0 ? (
                <>
                  {omisos.length} {omisos.length === 1 ? 'periodo vencido' : 'periodos vencidos'} sin declarar ·{' '}
                  <Link to="/declaraciones?vista=omisos" className="font-medium text-brand-700 hover:underline">
                    Ver la lista
                  </Link>
                </>
              ) : (
                'Todos al día'
              )
            }
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
        {conCorrecciones && (
          <StatTile
            etiqueta="Correcciones a la baja por resolver"
            valor={String(datos.correccionesPorResolver.length)}
            icono={<ReceiptMinus className="size-5" />}
            detalle={
              primeraCorreccion ? (
                <>
                  <span className={correccionPronto ? 'font-medium text-amber-700' : undefined}>
                    La primera vence el {formatoFecha(primeraCorreccion.c.limite)}
                  </span>{' '}
                  ·{' '}
                  <Link to="/declaraciones?correccion=por_resolver" className="font-medium text-brand-700 hover:underline">
                    Ver
                  </Link>
                </>
              ) : (
                'Ninguna por resolver'
              )
            }
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
        <ProximosVencimientos municipioId={municipioId} className={primeraAncha} />

        {conRitVisible && <SolicitudesPendientes pendientes={datos.pendientes} />}

        {conAprobacion && <AprobacionesPendientes aprobaciones={datos.aprobaciones} />}

        <ListaDeudas
          titulo="Declaraciones no pagadas"
          descripcion="Tienen valor a pagar y no registran ningún pago. En ReteICA y AutoReteICA, solo el pago total le da efecto a la declaración."
          vacio="No hay declaraciones sin pagar"
          deudas={datos.noPagadas}
        />

        <ListaDeudas
          titulo="Declaraciones sin pagar el total de la deuda"
          descripcion="Registran pagos, pero no cubren el total a pagar."
          vacio="No hay declaraciones con pago incompleto"
          deudas={datos.pagoIncompleto}
        />
      </div>
    </>
  )
}
