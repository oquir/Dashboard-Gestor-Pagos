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
import type { ProximosVencimientosProps } from './ProximosVencimientos.types'
import { vencimientosProximos } from './ProximosVencimientos.utils'

/** Los próximos vencimientos del calendario, de cada formulario activo; si las fechas cambian por dígito, el rango. */
export default function ProximosVencimientos({
  className = '',
  municipioId,
}: ProximosVencimientosProps) {
  const { usuario } = useSesion()
  const configuraciones = useDatos((s) => s.configuraciones)
  const municipios = useDatos((s) => s.municipios)
  const puedeEditar = puede(usuario?.rol, 'editarConfiguracion')
  const fechaHoy = hoy()

  const proximos = useMemo(
    () => vencimientosProximos(configuraciones, municipios, municipioId, fechaHoy),
    [configuraciones, municipios, municipioId, fechaHoy],
  )

  return (
    <Card className={className}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="size-5 text-indigo-600" aria-hidden /> Próximos vencimientos
            tributarios
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Fechas límite de presentación y pago según el calendario municipal.
          </p>
        </div>
        {puedeEditar && (
          <Link
            to="/calendario"
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
            const vencido = item.diasHasta < 0
            // Con fechas por dígito, entre la primera y la última ya les venció a unos y a otros no.
            const enCurso = item.hasta !== undefined && item.diasRestantes <= 0 && !vencido
            const urgente = item.diasRestantes > 0 && item.diasRestantes <= 10

            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{item.impuesto}</p>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-medium">{item.periodoTexto}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500 mt-0.5">
                    {item.hasta
                      ? `Límite: del ${formatoFecha(item.fecha)} al ${formatoFecha(item.hasta)}, según el último dígito del NIT (sin DV)`
                      : `Límite: ${formatoFecha(item.fecha)}`}{' '}
                    {item.decreto ? `(${item.decreto})` : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {vencido ? (
                    <Badge tono="peligro">Venció hace {Math.abs(item.diasHasta)} d</Badge>
                  ) : enCurso ? (
                    <Badge tono="alerta">Venciendo por dígito</Badge>
                  ) : item.diasRestantes === 0 ? (
                    <Badge tono="peligro">Vence hoy</Badge>
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
