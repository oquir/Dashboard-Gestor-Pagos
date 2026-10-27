import { useMemo } from 'react'
import { PageHeader, StatTile } from '../components/molecules'
import { CargaAsobancaria, DescargaAsobancaria, TablaCartera, TablaPagosRecibidos } from '../components/organisms'
import { formatoCompacto } from '../lib/formato'
import { estadoPago, totalPagado } from '../lib/reglas'
import { useDeclaraciones, useVerRecaudo } from '../lib/sesion'
import { useDatos } from '../store'
import type { FilaCartera, FilaPago } from '../types'

export default function Pagos() {
  const declaraciones = useDeclaraciones()
  const inscripciones = useDatos((s) => s.inscripciones)
  const pagos = useDatos((s) => s.pagos)
  const verRecaudo = useVerRecaudo()

  const datos = useMemo(() => {
    const porId = new Map(declaraciones.map((d) => [d.id, d]))
    const nombres = new Map(inscripciones.map((i) => [i.id, i.nombre]))
    const reemplazadas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))

    const cartera: FilaCartera[] = declaraciones
      .filter((d) => !reemplazadas.has(d.id))
      .map((d) => ({ d, estado: estadoPago(d, pagos), pagado: totalPagado(d.id, pagos), nombre: nombres.get(d.inscripcionId) ?? '' }))
      .filter((f) => f.estado === 'parcial' || f.estado === 'sin_pago' || f.estado === 'ineficaz')

    const recibidos: FilaPago[] = pagos.flatMap((p) => {
      const d = porId.get(p.declaracionId)
      return d ? [{ p, d, nombre: nombres.get(d.inscripcionId) ?? '' }] : []
    })

    const ineficaces = cartera.filter((f) => f.estado === 'ineficaz')
    return {
      cartera,
      recibidos,
      ineficaces,
      recaudo2026: recibidos.filter((r) => r.p.fecha.startsWith('2026')).reduce((s, r) => s + r.p.valor, 0),
      saldoIca: cartera.filter((f) => f.d.impuesto === 'ica').reduce((s, f) => s + f.d.totalAPagar - f.pagado, 0),
      saldoIneficaces: ineficaces.reduce((s, f) => s + f.d.totalAPagar - f.pagado, 0),
    }
  }, [declaraciones, inscripciones, pagos])

  return (
    <>
      <PageHeader
        titulo="Pagos"
        descripcion="Recaudo y cartera. En el ICA anual el pago puede ser parcial; en ReteICA y AutoReteICA solo el pago total le da efecto a la declaración."
      />

      <div className={`grid gap-4 ${verRecaudo ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {verRecaudo && (
          <StatTile etiqueta="Recaudado en 2026" valor={`$${formatoCompacto(datos.recaudo2026)}`} detalle={`${datos.recibidos.length} pagos registrados`} />
        )}
        <StatTile etiqueta="Saldo pendiente de ICA anual" valor={`$${formatoCompacto(datos.saldoIca)}`} detalle="Pagos parciales y declaraciones sin pago" />
        <StatTile
          etiqueta="ReteICA y AutoReteICA ineficaces"
          valor={String(datos.ineficaces.length)}
          detalle={`$${formatoCompacto(datos.saldoIneficaces)} sin pagar`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CargaAsobancaria />
        <DescargaAsobancaria declaraciones={declaraciones} />
      </div>

      <div className="mt-6 space-y-6">
        <TablaCartera cartera={datos.cartera} />
        <TablaPagosRecibidos pagos={datos.recibidos} />
      </div>
    </>
  )
}
