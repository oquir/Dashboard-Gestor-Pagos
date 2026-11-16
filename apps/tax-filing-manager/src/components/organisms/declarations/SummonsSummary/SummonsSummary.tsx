import { useState } from 'react'
import {
  canBeRemoved,
  summonsSituation,
  situationText,
  summonsStatusLabel,
  summonsTypeLabel,
  formatDate,
  can,
  useSession,
  summonsTone,
} from '../../../../lib'
import { useData } from '../../../../store'
import { today } from '../../../../utils'
import { Badge, Button } from '../../../atoms'
import { SentDocuments, Modal } from '../../../molecules'
import type { SummonsSummaryProps } from './SummonsSummary.types'
import { termText } from './SummonsSummary.utils'

/**
 * Un emplazamiento: su estado, el número del acto, la notificación, el plazo o lo que sigue, y la copia. Mientras nadie
 * lo responda, el administrador y el funcionario lo pueden quitar si se registró por error.
 */
export default function SummonsSummary({ e, detail = false, className = '' }: SummonsSummaryProps) {
  const declarations = useData((s) => s.declarations)
  const removeSummons = useData((s) => s.removeSummons)
  const { user } = useSession()
  const [confirming, setConfirming] = useState(false)
  const situation = summonsSituation(e, declarations, today())
  const canRemove = can(user?.role, 'review') && canBeRemoved(e, declarations)

  return (
    <div className={`text-xs ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={summonsTone[situation.status]}>{summonsStatusLabel[situation.status]}</Badge>
        {canRemove && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-fg-muted underline hover:text-danger-fg"
          >
            Quitar
          </button>
        )}
      </div>
      <p className="mt-1 whitespace-nowrap tabular-nums text-fg">
        N.º {e.number} · notificado el {formatDate(e.notificationDate)}
      </p>
      <p className="mt-0.5 text-fg-muted">
        {detail ? situationText(e, situation) : termText(e, situation)}
      </p>
      {e.copy && (
        <SentDocuments
          className="mt-1"
          documents={[e.copy]}
          title={summonsTypeLabel[e.kind]}
          context={[`N.º ${e.number}`, `Notificado el ${formatDate(e.notificationDate)}`]}
        />
      )}

      {confirming && (
        <Modal
          title="Quitar el emplazamiento"
          description={`Quita el registro del emplazamiento N.º ${e.number}. Úsalo solo si se registró por error: queda en la bitácora.`}
          close={() => setConfirming(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  removeSummons(e.id)
                  setConfirming(false)
                }}
              >
                Quitar
              </Button>
            </>
          }
        >
          <p className="text-sm text-fg-soft">
            El aplicativo dejará de liquidarle la sanción más alta por este emplazamiento.
          </p>
        </Modal>
      )}
    </div>
  )
}
