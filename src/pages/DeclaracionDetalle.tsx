import { Link, useParams } from 'react-router'
import { Badge, Card } from '../components/atoms'
import { Aviso, Vacio } from '../components/molecules'
import {
  AprobacionPrevia,
  AvisoSinCalendario,
  AvisoSinConsignar,
  ContribuyenteDeclaracion,
  DatosDeclaracion,
  FirmasDeclaracion,
  Liquidacion,
  ListaArchivos,
  PagosDeclaracion,
  PagoVentanilla,
  SolicitudCorreccion,
  ValidacionesDeclaracion,
} from '../components/organisms'
import { PlantillaDetalle } from '../components/templates'
import { cargaCalendario, presentadaSinCalendario } from '../lib/calendario'
import { etiquetaEstadoCorreccion, etiquetaEstadoPago, etiquetaImpuesto, etiquetaPeriodo, formatoFecha, formatoPesos, textoTipoDeclaracion } from '../lib/formato'
import { puede } from '../lib/permisos'
import { correccionPorResolver, correccionVigente, esCorreccionABaja, pagoEnExceso, sePuedePagar, totalEnCanje, totalPagado } from '../lib/reglas'
import { conRit, impuestoActivo, seValidaContraRit, useAprobacion, useEstadoPago, useSesion, useSinConsignar, useSolicitudCorreccion, ventanillaDe } from '../lib/sesion'
import { tonoCorreccion, tonoPago } from '../lib/tonos'
import { useDatos } from '../store'

export default function DeclaracionDetalle() {
  const { id } = useParams()
  const { usuario } = useSesion()
  const declaraciones = useDatos((s) => s.declaraciones)
  const inscripciones = useDatos((s) => s.inscripciones)
  const pagos = useDatos((s) => s.pagos)
  const cheques = useDatos((s) => s.cheques)
  const municipios = useDatos((s) => s.municipios)
  const configuraciones = useDatos((s) => s.configuraciones)
  const aprobacion = useAprobacion()
  const correccion = useSolicitudCorreccion()
  const estadoDe = useEstadoPago()
  // De todas las declaraciones: 1cero1 puede abrir una de un municipio distinto del que eligió en el buscador.
  const sinConsignar = useSinConsignar(declaraciones)
  const d = declaraciones.find((x) => x.id === id)

  if (!d || (usuario?.municipioId && d.municipioId !== usuario.municipioId)) {
    return <Vacio titulo="No se encontró la declaración" descripcion="Puede que no exista o que sea de otro municipio." />
  }
  if (!impuestoActivo(municipios)(d)) {
    return <Vacio titulo={`${etiquetaImpuesto[d.impuesto]} no está activo en este municipio`} descripcion="1cero1 lo puede activar en Municipios." />
  }

  const ins = inscripciones.find((i) => i.id === d.inscripcionId)
  const estado = estadoDe(d)
  const retencion = sinConsignar.find((r) => r.d.id === d.id)
  const corregida = d.corrigeA ? declaraciones.find((x) => x.id === d.corrigeA) : undefined
  // La solicitud de corrección que no se ha aceptado no la reemplaza: esta sigue vigente.
  const reemplazo = declaraciones.find((x) => x.corrigeA === d.id && correccionVigente(correccion(x)))
  // La que espera respuesta: si el municipio no la resuelve a tiempo, se acepta sola y la reemplaza.
  const porResolver = declaraciones.find((x) => x.corrigeA === d.id && correccionPorResolver(correccion(x)))
  const limitePorResolver = porResolver && correccion(porResolver)?.limite
  const solicitud = correccion(d)
  // Mientras no se acepte, la solicitud no se paga: su estado de pago no aplica.
  const vigente = correccionVigente(solicitud)
  const aLaBaja = esCorreccionABaja(d, corregida)
  const exceso = vigente ? pagoEnExceso(d) : 0
  const municipioConRit = conRit(municipios)(d)
  // Su ficha del RIT: solo si el municipio tiene el RIT en el aplicativo y el contribuyente está inscrito.
  const enRit = municipioConRit ? ins : undefined
  const situacion = aprobacion(d)
  const municipio = municipios.find((m) => m.id === d.municipioId)
  // Efectivo y cheque se activan por formulario: solo se ofrece lo que tiene el de esta declaración.
  const ventanilla = ventanillaDe(municipio, d.impuesto)
  const cfg = configuraciones.find((c) => c.municipioId === d.municipioId)
  const chequeParcial = cfg?.chequeParcial ?? false
  const sinCalendario = presentadaSinCalendario(d, cfg)
  // Lo que está en canje no se vuelve a cobrar mientras el banco responde.
  const saldo = Math.max(d.totalAPagar - totalPagado(d.id, pagos) - totalEnCanje(d.id, cheques), 0)
  // En ventanilla solo se recibe lo que ya es deuda: ni lo reemplazado por una corrección, ni lo que espera aprobación,
  // ni la solicitud de corrección que no se ha aceptado.
  const recibeVentanilla =
    (ventanilla.efectivo || ventanilla.cheque) && puede(usuario?.rol, 'registrarPagoVentanilla') && !reemplazo && sePuedePagar(situacion) && correccionVigente(solicitud)

  return (
    <PlantillaDetalle
      volver={{ a: '/declaraciones', texto: 'Declaraciones' }}
      titulo={`${etiquetaImpuesto[d.impuesto]} · ${etiquetaPeriodo(d)}`}
      descripcion={`Radicado ${d.numero}`}
      acciones={
        <>
          <Badge tono="info">{textoTipoDeclaracion(d.tipo, aLaBaja)}</Badge>
          {solicitud && !vigente ? (
            <Badge tono={tonoCorreccion[solicitud.estado]}>Solicitud {etiquetaEstadoCorreccion[solicitud.estado].toLowerCase()}</Badge>
          ) : (
            <Badge tono={tonoPago[estado]}>{etiquetaEstadoPago[estado]}</Badge>
          )}
        </>
      }
      aviso={
        (reemplazo || porResolver || !vigente || exceso > 0 || retencion || sinCalendario) && (
          <div className="space-y-3">
            {reemplazo ? (
              <Aviso tono="info">
                Esta declaración fue reemplazada por la corrección{' '}
                <Link className="font-medium underline" to={`/declaraciones/${reemplazo.id}`}>{reemplazo.numero}</Link>.
              </Aviso>
            ) : (
              <>
                {porResolver && limitePorResolver && (
                  <Aviso tono="alerta">
                    Tiene una solicitud de corrección a la baja por resolver, la{' '}
                    <Link className="font-medium underline" to={`/declaraciones/${porResolver.id}`}>{porResolver.numero}</Link>. Si el municipio
                    no la resuelve antes del {formatoFecha(limitePorResolver)}, se acepta sola y reemplaza a esta declaración.
                  </Aviso>
                )}
                {retencion && <AvisoSinConsignar r={retencion} />}
              </>
            )}
            {!vigente && corregida && (
              <Aviso tono={solicitud?.estado === 'rechazada' ? 'peligro' : 'info'}>
                {solicitud?.estado === 'rechazada' ? 'Se rechazó esta solicitud de corrección a la baja: sigue vigente la declaración ' : 'Es una solicitud de corrección a la baja: mientras el municipio no la acepte, no se paga y sigue vigente la declaración '}
                <Link className="font-medium underline" to={`/declaraciones/${corregida.id}`}>{corregida.numero}</Link>.
              </Aviso>
            )}
            {exceso > 0 && corregida && (
              <Aviso tono="info">
                Con la declaración que corrige, la {corregida.numero}, se pagaron {formatoPesos(exceso)} más de lo que liquida esta corrección.
                Es un pago en exceso: el contribuyente lo puede pedir al municipio en devolución o compensación.
              </Aviso>
            )}
            {sinCalendario && <AvisoSinCalendario d={d} carga={cargaCalendario(cfg, d.vigencia)} />}
          </div>
        )
      }
      principal={
        <>
          {/* Sin ficha del RIT, lo que dice la declaración es todo lo que se sabe del contribuyente: va arriba de la liquidación. */}
          {!enRit && <ContribuyenteDeclaracion d={d} noInscrito={municipioConRit && !d.inscripcionId} ancha />}
          <Liquidacion d={d} />
          {vigente && <PagosDeclaracion d={d} pagos={pagos} cheques={cheques} />}
          {recibeVentanilla && <PagoVentanilla key={d.id} d={d} saldo={saldo} medios={ventanilla} chequeParcial={chequeParcial} />}
        </>
      }
      lateral={
        <>
          {solicitud && (
            <SolicitudCorreccion d={d} corregida={corregida} situacion={solicitud} correo={d.contribuyente.correo} puedeResolver={puede(usuario?.rol, 'revisar')} />
          )}
          {situacion && <AprobacionPrevia d={d} situacion={situacion} correo={d.contribuyente.correo} puedeResolver={puede(usuario?.rol, 'revisar')} ventanilla={ventanilla} />}
          <DatosDeclaracion d={d} corregida={corregida} aLaBaja={aLaBaja} />
          {enRit && <ContribuyenteDeclaracion d={d} ins={enRit} />}
          <FirmasDeclaracion d={d} />
          <Card>
            <ListaArchivos
              titulo="Archivos adjuntos"
              descripcion="Anexos que el contribuyente cargó con la declaración."
              items={d.adjuntos.map((a) => ({ titulo: a.nombre, archivo: a.archivo }))}
              contexto={[`Declaración ${d.numero}`, `Contribuyente: ${d.contribuyente.nombre}`]}
              nombreZip={`adjuntos_${d.numero}.zip`}
              vacio="No cargó archivos."
            />
          </Card>
          <ValidacionesDeclaracion d={d} ins={ins} contraRit={seValidaContraRit(municipios, d)} municipioConRit={municipioConRit} corregida={corregida} />
        </>
      }
    />
  )
}
