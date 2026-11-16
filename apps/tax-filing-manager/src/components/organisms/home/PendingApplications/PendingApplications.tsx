import { ritChangeKindLabel, formatDate } from '../../../../lib'
import { Badge, Card } from '../../../atoms'
import { CardHeader, LinkItem, EmptyState } from '../../../molecules'
import type { PendingApplicationsProps } from './PendingApplications.types'

/** Las seis solicitudes del RIT por revisar más recientes; cada una lleva a la ficha del inscrito. */
export default function PendingApplications({
  pendingOnes,
  className = '',
}: PendingApplicationsProps) {
  return (
    <Card className={className}>
      <CardHeader
        title="Solicitudes pendientes del RIT"
        description="Inscripciones, actualizaciones y cancelaciones por revisar."
      />
      {pendingOnes.length === 0 ? (
        <EmptyState title="No hay solicitudes pendientes" />
      ) : (
        <ul className="divide-y divide-border-subtle">
          {pendingOnes.slice(0, 6).map(({ reg, ritChange }) => (
            <LinkItem
              key={ritChange.id}
              a={`/rit/${reg.id}`}
              title={reg.name}
              detail={ritChange.description}
              right={
                <>
                  <Badge tone="alert">{ritChangeKindLabel[ritChange.kind]}</Badge>
                  <p className="mt-1 text-xs text-fg-muted">{formatDate(ritChange.date)}</p>
                </>
              }
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
