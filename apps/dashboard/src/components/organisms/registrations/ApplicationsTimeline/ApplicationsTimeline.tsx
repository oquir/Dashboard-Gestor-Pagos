import {
  ritChangeStatusLabel,
  ritChangeKindLabel,
  formatDate,
  ritChangeTone,
} from '../../../../lib'
import { Badge, Card } from '../../../atoms'
import { CardHeader, SelectableItem } from '../../../molecules'
import SentReply from '../SentReply'
import type { ApplicationsTimelineProps } from './ApplicationsTimeline.types'

/** Solicitudes del inscrito, de la más reciente a la más antigua. Al elegir una, su formulario se ve en la ficha. */
export default function ApplicationsTimeline({
  registration,
  application,
  pick,
  config,
  canReview,
}: ApplicationsTimelineProps) {
  const ritChanges = [...registration.ritChanges].reverse()

  return (
    <Card>
      <CardHeader
        title="Solicitudes y novedades"
        description="Elige una para ver el formulario que diligenció el contribuyente."
      />
      <ol className="space-y-4 p-5">
        <li className={`border-l-2 pl-2 ${application ? 'border-slate-200' : 'border-brand-600'}`}>
          <SelectableItem isActive={!application} onClick={() => pick(null)}>
            <span className="block text-sm font-medium text-slate-900">Datos actuales</span>
            <span className="mt-1 block text-xs text-slate-500">
              Cómo está hoy la ficha del inscrito.
            </span>
          </SelectableItem>
        </li>
        {ritChanges.map((n) => (
          <li
            key={n.id}
            className={`border-l-2 pl-2 ${application === n ? 'border-brand-600' : 'border-slate-200'}`}
          >
            <SelectableItem isActive={application === n} onClick={() => pick(n.id)}>
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900">
                  {ritChangeKindLabel[n.kind]}
                </span>
                <Badge tone={ritChangeTone[n.status]}>{ritChangeStatusLabel[n.status]}</Badge>
              </span>
              <span className="mt-1 block text-sm text-slate-600">{n.description}</span>
              <span className="mt-1 block text-xs text-slate-500">
                Radicada el {formatDate(n.date)}
                {n.reviewedBy &&
                  n.reviewDate &&
                  ` · revisó ${n.reviewedBy} el ${formatDate(n.reviewDate)}`}
              </span>
            </SelectableItem>
            <div className="px-2">
              <SentReply ritChange={n} registration={registration} />
              {n.kind === 'cancellation' && n.status === 'pending' && config && (
                <p className="mt-1 text-xs text-amber-800">
                  {config.automaticRitCancellation
                    ? 'En este municipio la cancelación es automática al aprobar.'
                    : 'La administración debe verificar el cese antes de aprobar la cancelación.'}
                </p>
              )}
              {n.status === 'pending' && canReview && (
                <a
                  href={`#respuesta-${n.id}`}
                  className="mt-2 inline-block text-xs font-medium text-brand-700 hover:underline"
                >
                  Responder solicitud
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
