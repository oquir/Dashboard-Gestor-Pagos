import { useMemo } from 'react'
import { Aviso, PageHeader, StatTile } from '../components/molecules'
import {
  BuscadorMunicipios,
  CargaAsobancaria,
  ChequesEnCanje,
  DescargaAsobancaria,
  GraficoBarras,
  RetencionesSinConsignar,
  TablaCartera,
  TablaPagosRecibidos,
} from '../components/organisms'
import { formatoCompacto } from '../lib/formato'
import { puede } from '../lib/permisos'
import { correccionVigente, reemplazadas, totalPagado } from '../lib/reglas'
import {
  cargaAsobancariaVisible,
  chequesVisibles,
  IMPUESTOS,
  impuestosVisibles,
  recibeCheques,
  useDeclaraciones,
  useEstadoPago,
  useSesion,
  useSinConsignar,
  useSolicitudCorreccion,
  useVerRecaudo,
} from '../lib/sesion'
import { useDatos } from '../store'
import type { Barra, Declaracion, FilaCartera, FilaCheque, FilaPago, FilaSinConsignar, Municipio } from '../types'

export default function Pagos() {
  const declaraciones = useDeclaraciones()
  const pagos = useDatos((s) => s.pagos)
  const cheques = useDatos((s) => s.cheques)
  const estadoDe = useEstadoPago()
  const correccion = useSolicitudCorreccion()
  const retenciones = useSinConsignar()
  const verRecaudo = useVerRecaudo()
  const { usuario, municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const verCarga = cargaAsobancariaVisible(municipios, municipioId)
  const conRetencion = impuestosVisibles(municipios, municipioId).some((i) => i !== 'ica')
  // Si 1cero1 no eligió un municipio, las tablas no dicen de cuál es cada fila: en su lugar van gráficas por municipio.
  const todos = municipioId === null

  const datos = useMemo(() => {
    const porId = new Map(declaraciones.map((d) => [d.id, d]))
    // Ni lo reemplazado por una corrección ni las solicitudes de corrección que no se han aceptado son cartera.
    const fuera = reemplazadas(declaraciones, correccion)

    const cartera: FilaCartera[] = declaraciones
      .filter((d) => !fuera.has(d.id) && correccionVigente(correccion(d)))
      .map((d) => ({ d, estado: estadoDe(d), pagado: totalPagado(d.id, pagos), nombre: d.contribuyente.nombre }))
      .filter((f) => f.estado === 'parcial' || f.estado === 'sin_pago' || f.estado === 'ineficaz')

    const recibidos: FilaPago[] = pagos.flatMap((p) => {
      const d = porId.get(p.declaracionId)
      return d ? [{ p, d, nombre: d.contribuyente.nombre }] : []
    })

    const enCanje: FilaCheque[] = cheques.flatMap((c) => {
      const d = porId.get(c.declaracionId)
      return d && c.estado === 'en_canje' ? [{ c, d, nombre: d.contribuyente.nombre }] : []
    })

    const sinConsignar: FilaSinConsignar[] = retenciones.map((r) => ({ ...r, nombre: r.d.contribuyente.nombre }))
    return {
      cartera,
      recibidos,
      enCanje,
      sinConsignar,
      vencidas: retenciones.filter((r) => r.dias < 0).length,
      recaudo2026: recibidos.filter((r) => r.p.fecha.startsWith('2026')).reduce((s, r) => s + r.p.valor, 0),
      saldoIca: cartera.filter((f) => f.d.impuesto === 'ica').reduce((s, f) => s + f.d.totalAPagar - f.pagado, 0),
      saldoSinConsignar: retenciones.reduce((s, r) => s + r.saldo, 0),
    }
  }, [declaraciones, pagos, cheques, estadoDe, correccion, retenciones])

  return (
    <>
      <PageHeader
        titulo="Pagos"
        descripcion="Recaudo y cartera. En el ICA anual el pago puede ser parcial; en ReteICA y AutoReteICA solo el pago total le da efecto a la declaración."
      />
      <BuscadorMunicipios />

      <div className={`grid gap-4 ${verRecaudo ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {verRecaudo && (
          <StatTile etiqueta="Recaudado en 2026" valor={`$${formatoCompacto(datos.recaudo2026)}`} detalle={`${datos.recibidos.length} pagos registrados`} />
        )}
        <StatTile etiqueta="Saldo pendiente de ICA anual" valor={`$${formatoCompacto(datos.saldoIca)}`} detalle="Pagos parciales y declaraciones sin pago" />
        <StatTile
          etiqueta="Retenciones sin consignar"
          valor={String(datos.sinConsignar.length)}
          detalle={
            datos.sinConsignar.length === 0 ? (
              'Todo lo retenido está consignado'
            ) : (
              <>
                ${formatoCompacto(datos.saldoSinConsignar)} ·{' '}
                {datos.vencidas > 0 ? (
                  <span className="text-red-700">{datos.vencidas === 1 ? '1 pasó' : `${datos.vencidas} pasaron`} los 2 meses</span>
                ) : (
                  'dentro del plazo'
                )}
              </>
            )
          }
        />
      </div>

      {todos ? (
        <>
          <div className="mt-6">
            <Aviso tono="info">Elige un municipio arriba para ver el detalle de sus pagos, su cartera, sus retenciones y sus cheques, y para cargar o descargar el Asobancaria.</Aviso>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <GraficoBarras
              titulo="Pagos recibidos por municipio"
              descripcion="Suma de los pagos registrados."
              formato="pesos"
              barras={barrasPorMunicipio(
                municipios.filter((m) => IMPUESTOS.some((i) => m.impuestos[i])),
                datos.recibidos,
                (f) => f.p.valor,
              )}
            />
            <GraficoBarras
              titulo="Cartera pendiente por municipio"
              descripcion="Saldo de las declaraciones sin pago, con pago parcial o ineficaces."
              formato="pesos"
              barras={barrasPorMunicipio(
                municipios.filter((m) => IMPUESTOS.some((i) => m.impuestos[i])),
                datos.cartera,
                (f) => f.d.totalAPagar - f.pagado,
              )}
            />
            {conRetencion && (
              <GraficoBarras
                titulo="Retenciones sin consignar por municipio"
                descripcion="Saldo de ReteICA y AutoReteICA que falta consignar."
                formato="pesos"
                barras={barrasPorMunicipio(
                  municipios.filter((m) => m.impuestos.reteica || m.impuestos.autorretencion),
                  datos.sinConsignar,
                  (f) => f.saldo,
                )}
              />
            )}
            {(chequesVisibles(municipios, municipioId) || datos.enCanje.length > 0) && (
              <GraficoBarras
                titulo="Cheques en canje por municipio"
                descripcion="Valor de los cheques de gerencia que esperan la respuesta del banco."
                formato="pesos"
                barras={barrasPorMunicipio(
                  municipios.filter((m) => recibeCheques(m) || datos.enCanje.some((f) => f.d.municipioId === m.id)),
                  datos.enCanje,
                  (f) => f.c.valor,
                )}
              />
            )}
          </div>
        </>
      ) : (
        <>
          {conRetencion && (
            <div className="mt-6">
              <RetencionesSinConsignar filas={datos.sinConsignar} />
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {verCarga && <CargaAsobancaria />}
            <DescargaAsobancaria declaraciones={declaraciones} />
          </div>

          <div className="mt-6 space-y-6">
            {/* Si 1cero1 quita los cheques, los que quedaron en canje se siguen resolviendo. */}
            {(chequesVisibles(municipios, municipioId) || datos.enCanje.length > 0) && (
              <ChequesEnCanje cheques={datos.enCanje} puedeResolver={puede(usuario?.rol, 'registrarPagoVentanilla')} />
            )}
            <TablaCartera cartera={datos.cartera} />
            <TablaPagosRecibidos pagos={datos.recibidos} />
          </div>
        </>
      )}
    </>
  )
}

/** Una barra por municipio con la suma de sus filas, de mayor a menor. */
function barrasPorMunicipio<T extends { d: Declaracion }>(municipios: Municipio[], filas: T[], valor: (f: T) => number): Barra[] {
  return municipios
    .map((m) => ({ etiqueta: m.nombre, valor: filas.filter((f) => f.d.municipioId === m.id).reduce((s, f) => s + valor(f), 0) }))
    .sort((a, b) => b.valor - a.valor)
}
