import { Calendar } from 'reicon-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { formatDate, can, useSession } from '../../../../lib'
import { useData } from '../../../../store'
import { today } from '../../../../utils'
import { Badge, Card } from '../../../atoms'
import { EmptyState } from '../../../molecules'
import type { UpcomingDueDatesProps } from './UpcomingDueDates.types'
import { upcomingDueDates } from './UpcomingDueDates.utils'

/** Los próximos vencimientos del calendario, de cada formulario activo; si las fechas cambian por dígito, el rango. */
export default function UpcomingDueDates({
  className = '',
  municipalityId,
}: UpcomingDueDatesProps) {
  const { user } = useSession()
  const settingsList = useData((s) => s.settingsList)
  const municipalities = useData((s) => s.municipalities)
  const canEdit = can(user?.role, 'editSettings')
  const todayDate = today()

  const upcoming = useMemo(
    () => upcomingDueDates(settingsList, municipalities, municipalityId, todayDate),
    [settingsList, municipalities, municipalityId, todayDate],
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
        {canEdit && (
          <Link
            to="/calendario"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline shrink-0"
          >
            Configurar calendario
          </Link>
        )}
      </div>

      {upcoming.length === 0 ? (
        <EmptyState title="No hay vencimientos próximos registrados" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {upcoming.map((item) => {
            const isOverdue = item.daysUntil < 0
            // Con fechas por dígito, entre la primera y la última ya les venció a unos y a otros no.
            const ongoing = item.to !== undefined && item.daysLeft <= 0 && !isOverdue
            const urgent = item.daysLeft > 0 && item.daysLeft <= 10

            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{item.tax}</p>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-medium">{item.periodText}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500 mt-0.5">
                    {item.to
                      ? `Límite: del ${formatDate(item.date)} al ${formatDate(item.to)}, según el último dígito del NIT (sin DV)`
                      : `Límite: ${formatDate(item.date)}`}{' '}
                    {item.decree ? `(${item.decree})` : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {isOverdue ? (
                    <Badge tone="danger">Venció hace {Math.abs(item.daysUntil)} d</Badge>
                  ) : ongoing ? (
                    <Badge tone="alert">Venciendo por dígito</Badge>
                  ) : item.daysLeft === 0 ? (
                    <Badge tone="danger">Vence hoy</Badge>
                  ) : urgent ? (
                    <Badge tone="alert">Vence en {item.daysLeft} días</Badge>
                  ) : (
                    <Badge tone="neutral">En {item.daysLeft} días</Badge>
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
