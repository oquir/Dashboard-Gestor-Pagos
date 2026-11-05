import { useMemo } from 'react'
import { PageHeader, StatTile } from '../components/molecules'
import { BuscadorMunicipios, CargaAsobancaria, ChequesEnCanje, DescargaAsobancaria, RetencionesSinConsignar, TablaCartera, TablaPagosRecibidos } from '../components/organisms'
import { formatoCompacto } from '../lib/formato'
import { puede } from '../lib/permisos'
import { totalPagado } from '../lib/reglas'
import { cargaAsobancariaVisible, chequesVisibles, impuestosVisibles, useDeclaraciones, useEstadoPago, useSesion, useSinConsignar, useVerRecaudo } from '../lib/sesion'
import { useDatos } from '../store'
import type { FilaCartera, FilaCheque, FilaPago, FilaSinConsignar } from '../types'

export default function Pagos() {
  const declaraciones = useDeclaraciones()
  const inscripciones = useDatos((s) => s.inscripciones)
  const pagos = useDatos((s) => s.pagos)
  const cheques = useDatos((s) => s.cheques)
  const estadoDe = useEstadoPago()
  const retenciones = useSinConsignar()
  const verRecaudo = useVerRecaudo()
  const { usuario, municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const verCarga = cargaAsobancariaVisible(municipios, municipioId)
  const conRetencion = impuestosVisibles(municipios, municipioId).some((i) => i !== 'ica')

  const datos = useMemo(() => {
    const porId = new Map(declaraciones.map((d) => [d.id, d]))
    const nombres = new Map(inscripciones.map((i) => [i.id, i.nombre]))
    const reemplazadas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))

    const cartera: FilaCartera[] = declaraciones
      .filter((d) => !reemplazadas.has(d.id))
      .map((d) => ({ d, estado: estadoDe(d), pagado: totalPagado(d.id, pagos), nombre: nombres.get(d.inscripcionId) ?? '' }))
      .filter((f) => f.estado === 'parcial' || f.estado === 'sin_pago' || f.estado === 'ineficaz')

    const recibidos: FilaPago[] = pagos.flatMap((p) => {
      const d = porId.get(p.declaracionId)
      return d ? [{ p, d, nombre: nombres.get(d.inscripcionId) ?? '' }] : []
    })

    const enCanje: FilaCheque[] = cheques.flatMap((c) => {
      const d = porId.get(c.declaracionId)
      return d && c.estado === 'en_canje' ? [{ c, d, nombre: nombres.get(d.inscripcionId) ?? '' }] : []
    })

    const sinConsignar: FilaSinConsignar[] = retenciones.map((r) => ({ ...r, nombre: nombres.get(r.d.inscripcionId) ?? '' }))
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
  }, [declaraciones, inscripciones, pagos, cheques, estadoDe, retenciones])

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
  )
}
