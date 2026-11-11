import { useState } from 'react'
import {
  approvalStatusLabel,
  taxLabel,
  periodLabel,
  formatDate,
  awaitsApproval,
  approvalTone,
} from '../../../../lib'
import { Badge, Card } from '../../../atoms'
import { CardHeader, Filter, LinkItem, EmptyState } from '../../../molecules'
import { FILTER_OPTIONS } from './PendingApprovals.constants'
import type { PendingApprovalsProps, ApprovalsFilter } from './PendingApprovals.types'

/** Declaraciones con aprobación previa, filtradas por estado; por defecto, las que esperan aprobación. */
export default function PendingApprovals({ approvals, className = '' }: PendingApprovalsProps) {
  const [filter, setFilter] = useState<ApprovalsFilter>('all_pending')
  const list = approvals.filter((x) =>
    filter === 'all_pending' ? awaitsApproval(x.a) : !filter || x.a.status === filter,
  )

  return (
    <Card className={className}>
      <CardHeader
        title="Aprobación previa"
        description="El contribuyente paga cuando se aprueban. Lo pendiente va primero, por plazo."
        actions={
          <Filter label="Aprobación" options={FILTER_OPTIONS} value={filter} change={setFilter} />
        }
      />
      {list.length === 0 ? (
        <EmptyState
          title={
            filter === 'all_pending'
              ? 'No hay declaraciones por aprobar'
              : 'No hay declaraciones con esa aprobación'
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {list.slice(0, 6).map(({ d, a }) => (
            <LinkItem
              key={d.id}
              a={`/declaraciones/${d.id}`}
              title={d.taxpayer.name}
              detail={`${d.number} · ${taxLabel[d.tax]} · ${periodLabel(d)}`}
              right={
                <>
                  <Badge tone={approvalTone[a.status]}>{approvalStatusLabel[a.status]}</Badge>
                  <p className="mt-1 text-xs text-slate-500">
                    {awaitsApproval(a)
                      ? `Plazo: ${formatDate(a.limit)}`
                      : formatDate(a.date ?? a.limit)}
                  </p>
                </>
              }
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
