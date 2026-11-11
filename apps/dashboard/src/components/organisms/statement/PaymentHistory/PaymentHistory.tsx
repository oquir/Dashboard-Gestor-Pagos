import { Link } from 'react-router'
import {
  checkStatusLabel,
  checkTone,
  formatDate,
  formatPesos,
  periodLabel,
  taxLabel,
} from '../../../../lib'
import { Badge, Card } from '../../../atoms'
import { CardHeader, EmptyState } from '../../../molecules'
import type { PaymentHistoryProps } from './PaymentHistory.types'

/** Todos los pagos del contribuyente, también los de declaraciones que después se corrigieron, y los cheques sin pagar. */
export default function PaymentHistory({ movements }: PaymentHistoryProps) {
  return (
    <Card>
      <CardHeader
        title="Historial de pagos"
        description="Todos los pagos del contribuyente, también los de declaraciones que después se corrigieron."
      />
      {movements.length === 0 ? (
        <EmptyState title="No hay pagos registrados" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {movements.map((m) => {
            const { d } = m
            const returned = m.kind === 'check' && m.c.status === 'returned'
            return (
              <li
                key={m.kind === 'payment' ? m.p.id : m.c.id}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <span className="min-w-0 text-slate-700">
                  {m.kind === 'payment'
                    ? `${formatDate(m.p.date)} · ${m.p.method}`
                    : `${formatDate(m.c.receiptDate)} · Cheque de gerencia ${m.c.number}, ${m.c.bank}`}
                  <span className="block text-xs text-slate-500">
                    <Link
                      to={`/declaraciones/${d.id}`}
                      className="hover:text-brand-700 hover:underline"
                    >
                      {taxLabel[d.tax]} · {periodLabel(d)} · {d.number}
                    </Link>
                    {m.kind === 'payment' && m.p.receipt && ` · Recibo de caja ${m.p.receipt}`}
                    {m.kind === 'check' && ` · Recibo de caja ${m.c.receipt}`}
                    {m.kind === 'check' && m.c.returnReason && ` · devuelto: ${m.c.returnReason}`}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {m.kind === 'check' && (
                    <Badge tone={checkTone[m.c.status]}>{checkStatusLabel[m.c.status]}</Badge>
                  )}
                  <span
                    className={`tabular-nums ${returned ? 'text-slate-400 line-through' : 'text-slate-900'}`}
                  >
                    {formatPesos(m.kind === 'payment' ? m.p.value : m.c.value)}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
