import { AlertTriangle } from 'reicon-react'
import {
  paymentStatusLabel,
  taxLabel,
  periodLabel,
  formatPesos,
  paymentTone,
} from '../../../../lib'
import { Badge, Card } from '../../../atoms'
import { CardHeader, LinkItem, EmptyState } from '../../../molecules'
import type { DebtListProps } from './DebtList.types'

/** Declaraciones con deuda: las seis más recientes, con lo que falta por pagar. */
export default function DebtList({ title, description, empty, debts }: DebtListProps) {
  return (
    <Card>
      <CardHeader
        title={title}
        description={description}
        actions={<Badge tone={debts.length > 0 ? 'danger' : 'neutral'}>{debts.length}</Badge>}
      />
      {debts.length === 0 ? (
        <EmptyState title={empty} />
      ) : (
        <ul className="divide-y divide-border-subtle">
          {debts.slice(0, 6).map(({ d, status, paidAmount }) => (
            <LinkItem
              key={d.id}
              a={`/declaraciones/${d.id}`}
              title={d.taxpayer.name}
              detail={`${d.number} · ${taxLabel[d.tax]} · ${periodLabel(d)}`}
              right={
                <>
                  <Badge tone={paymentTone[status]}>
                    {status === 'ineffective' && <AlertTriangle className="size-3" aria-hidden />}
                    {status === 'ineffective' ? 'Ineficaz' : paymentStatusLabel[status]}
                  </Badge>
                  <p className="mt-1 text-xs tabular-nums text-fg">
                    {paidAmount > 0
                      ? `Debe ${formatPesos(d.totalToPay - paidAmount)} de ${formatPesos(d.totalToPay)}`
                      : formatPesos(d.totalToPay)}
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
