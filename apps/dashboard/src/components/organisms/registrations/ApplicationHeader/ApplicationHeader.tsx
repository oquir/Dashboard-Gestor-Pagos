import {
  ritChangeStatusLabel,
  ritChangeKindLabel,
  formatDate,
  ritChangeTone,
} from '../../../../lib'
import { Badge, Button } from '../../../atoms'
import type { ApplicationHeaderProps } from './ApplicationHeader.types'

/** Franja sobre el formulario de una solicitud: cuál se está viendo y cómo volver a los datos actuales. */
export default function ApplicationHeader({
  application,
  compared,
  showCurrent,
  lateItem,
}: ApplicationHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-5 py-4">
      <div>
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
          Formulario de {ritChangeKindLabel[application.kind].toLowerCase()} radicado el{' '}
          {formatDate(application.date)}
          <Badge tone={ritChangeTone[application.status]}>
            {ritChangeStatusLabel[application.status]}
          </Badge>
        </p>
        <p className="mt-0.5 text-sm text-slate-600">
          Lo que diligenció el contribuyente
          {compared ? '. Se marca lo que cambió frente a la solicitud aprobada anterior.' : '.'}
        </p>
        {lateItem && (
          <p className="mt-1 text-sm text-amber-800">
            Inscripción tardía: se radicó {lateItem.days === 1 ? '1 día' : `${lateItem.days} días`}{' '}
            después del plazo, que vencía el {formatDate(lateItem.limit)}. El municipio puede
            sancionarla según su estatuto.
          </p>
        )}
      </div>
      <Button variant="secondary" onClick={showCurrent}>
        Ver datos actuales
      </Button>
    </div>
  )
}
