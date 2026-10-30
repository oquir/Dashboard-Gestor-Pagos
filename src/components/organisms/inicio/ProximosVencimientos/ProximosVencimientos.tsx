import { Calendar } from 'reicon-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { formatoFecha } from '../../../../lib/formato'
import { puede } from '../../../../lib/permisos'
import { useSesion } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import { hoy } from '../../../../utils'
import { Badge, Card } from '../../../atoms'
import { Vacio } from '../../../molecules'
import type { ProximosVencimientosProps, VencimientoProximo } from './types'

const diferenciaDias = (fechaIso: string, hoyIso: string) => {
  const f = new Date(`${fechaIso}T12:00:00Z`).getTime()
  const h = new Date(`${hoyIso}T12:00:00Z`).getTime()
  return Math.round((f - h) / (1000 * 60 * 60 * 24))
}

export default function ProximosVencimientos({ className = '', municipioId }: ProximosVencimientosProps) {
  const { usuario } = useSesion()
  const configuraciones = useDatos((s) => s.configuraciones)
  const puedeEditar = puede(usuario?.rol, 'editarConfiguracion')
  const fechaHoy = hoy()

  const proximos = useMemo<VencimientoProximo[]>(() => {
    // Si hay un municipio específico seleccionado, solo sus vencimientos; si no, de todos
    const configs = municipioId
      ? configuraciones.filter((c) => c.municipioId === municipioId)
      : configuraciones

    const lista: VencimientoProximo[] = []

    for (const cfg of configs) {
      const esBimestral = cfg.periodicidadRetencion === 'bimestral'

      for (const cal of cfg.calendarioTributario?.porVigencia ?? []) {
        // 1. ICA Anual
        if (cal.vencimientoIca) {
          const dias = diferenciaDias(cal.vencimientoIca, fechaHoy)
          lista.push({
            id: `${cfg.municipioId}-${cal.vigencia}-ica`,
            impuesto: 'ICA Anual',
            periodoTexto: `Año gravable ${cal.vigencia}`,
            fecha: cal.vencimientoIca,
            decreto: cal.decreto,
            diasRestantes: dias,
          })
        }

        // 2. ReteICA
        for (const r of cal.vencimientosReteica ?? []) {
          if (!r.fecha) continue
          const dias = diferenciaDias(r.fecha, fechaHoy)
          const nombrePeriodo = esBimestral
            ? `Bimestre ${r.periodo}`
            : `Mes ${r.periodo}`

          lista.push({
            id: `${cfg.municipioId}-${cal.vigencia}-reteica-${r.periodo}`,
            impuesto: 'ReteICA y AutoReteICA',
            periodoTexto: `${nombrePeriodo} (${cal.vigencia})`,
            fecha: r.fecha,
            decreto: cal.decreto,
            diasRestantes: dias,
          })
        }
      }
    }

    // Filtrar los que no estén vencidos hace más de 30 días y ordenar por fecha más cercana hacia el futuro
    return lista
      .filter((v) => v.diasRestantes >= -15)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 5)
  }, [configuraciones, municipioId, fechaHoy])

  return (
    <Card className={className}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="size-5 text-indigo-600" aria-hidden /> Próximos vencimientos tributarios
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Fechas límite de presentación y pago según el calendario municipal.</p>
        </div>
        {puedeEditar && (
          <Link
            to="/configuracion"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline shrink-0"
          >
            Configurar calendario
          </Link>
        )}
      </div>

      {proximos.length === 0 ? (
        <Vacio titulo="No hay vencimientos próximos registrados" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {proximos.map((item) => {
            const esHoy = item.diasRestantes === 0
            const vencido = item.diasRestantes < 0
            const urgente = item.diasRestantes > 0 && item.diasRestantes <= 10

            return (
              <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{item.impuesto}</p>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-medium">{item.periodoTexto}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500 mt-0.5">
                    Límite: {formatoFecha(item.fecha)} {item.decreto ? `(${item.decreto})` : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {esHoy ? (
                    <Badge tono="peligro">Vence hoy</Badge>
                  ) : vencido ? (
                    <Badge tono="peligro">Venció hace {Math.abs(item.diasRestantes)} d</Badge>
                  ) : urgente ? (
                    <Badge tono="alerta">Vence en {item.diasRestantes} días</Badge>
                  ) : (
                    <Badge tono="neutral">En {item.diasRestantes} días</Badge>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
