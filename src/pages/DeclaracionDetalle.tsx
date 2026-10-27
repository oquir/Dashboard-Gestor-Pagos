import { Link, useParams } from 'react-router'
import { Badge, Card } from '../components/atoms'
import { Aviso, Vacio } from '../components/molecules'
import { AprobacionPrevia, DatosDeclaracion, Liquidacion, ListaArchivos, PagosDeclaracion, PagoVentanilla, ValidacionesDeclaracion } from '../components/organisms'
import { PlantillaDetalle } from '../components/templates'
import { etiquetaEstadoPago, etiquetaImpuesto, etiquetaPeriodo, etiquetaTipoDeclaracion } from '../lib/formato'
import { puede } from '../lib/permisos'
import { estadoPago, sePuedePagar, totalEnCanje, totalPagado } from '../lib/reglas'
import { conRit, impuestoActivo, seValidaContraRit, useAprobacion, useSesion, ventanillaDe } from '../lib/sesion'
import { tonoPago } from '../lib/tonos'
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
  const d = declaraciones.find((x) => x.id === id)

  if (!d || (usuario?.municipioId && d.municipioId !== usuario.municipioId)) {
    return <Vacio titulo="No se encontró la declaración" descripcion="Puede que no exista o que sea de otro municipio." />
  }
  if (!impuestoActivo(municipios)(d)) {
    return <Vacio titulo={`${etiquetaImpuesto[d.impuesto]} no está activo en este municipio`} descripcion="1cero1 lo puede activar en Municipios." />
  }

  const ins = inscripciones.find((i) => i.id === d.inscripcionId)
  const estado = estadoPago(d, pagos)
  const corregida = d.corrigeA ? declaraciones.find((x) => x.id === d.corrigeA) : undefined
  const reemplazo = declaraciones.find((x) => x.corrigeA === d.id)
  const municipioConRit = conRit(municipios)(d)
  const situacion = aprobacion(d)
  const municipio = municipios.find((m) => m.id === d.municipioId)
  // Efectivo y cheque se activan por formulario: solo se ofrece lo que tiene el de esta declaración.
  const ventanilla = ventanillaDe(municipio, d.impuesto)
  const chequeParcial = configuraciones.find((c) => c.municipioId === d.municipioId)?.chequeParcial ?? false
  // Lo que está en canje no se vuelve a cobrar mientras el banco responde.
  const saldo = Math.max(d.totalAPagar - totalPagado(d.id, pagos) - totalEnCanje(d.id, cheques), 0)
  // En ventanilla solo se recibe lo que ya es deuda: ni lo reemplazado por una corrección ni lo que espera aprobación.
  const recibeVentanilla = (ventanilla.efectivo || ventanilla.cheque) && puede(usuario?.rol, 'registrarPagoVentanilla') && !reemplazo && sePuedePagar(situacion)

  return (
    <PlantillaDetalle
      volver={{ a: '/declaraciones', texto: 'Declaraciones' }}
      titulo={`${etiquetaImpuesto[d.impuesto]} · ${etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo)}`}
      descripcion={`Radicado ${d.numero}`}
      acciones={
        <>
          <Badge tono="info">{etiquetaTipoDeclaracion[d.tipo]}</Badge>
          <Badge tono={tonoPago[estado]}>{etiquetaEstadoPago[estado]}</Badge>
        </>
      }
      aviso={
        reemplazo && (
          <Aviso tono="info">
            Esta declaración fue reemplazada por la corrección{' '}
            <Link className="font-medium underline" to={`/declaraciones/${reemplazo.id}`}>{reemplazo.numero}</Link>.
          </Aviso>
        )
      }
      principal={
        <>
          <Liquidacion d={d} />
          <PagosDeclaracion d={d} pagos={pagos} cheques={cheques} />
          {recibeVentanilla && <PagoVentanilla key={d.id} d={d} saldo={saldo} medios={ventanilla} chequeParcial={chequeParcial} />}
        </>
      }
      lateral={
        <>
          {situacion && <AprobacionPrevia d={d} situacion={situacion} correo={ins?.correo ?? ''} puedeResolver={puede(usuario?.rol, 'revisar')} ventanilla={ventanilla} />}
          <DatosDeclaracion d={d} ins={ins} corregida={corregida} enlazarRit={municipioConRit} />
          <Card>
            <ListaArchivos
              titulo="Archivos adjuntos"
              descripcion="Anexos que el contribuyente cargó con la declaración."
              items={d.adjuntos.map((a) => ({ titulo: a.nombre, archivo: a.archivo }))}
              contexto={[`Declaración ${d.numero}`, `Declarante: ${ins?.nombre ?? ''}`]}
              nombreZip={`adjuntos_${d.numero}.zip`}
              vacio="No cargó archivos."
            />
          </Card>
          <ValidacionesDeclaracion d={d} ins={ins} contraRit={seValidaContraRit(municipios, d)} municipioConRit={municipioConRit} />
        </>
      }
    />
  )
}
