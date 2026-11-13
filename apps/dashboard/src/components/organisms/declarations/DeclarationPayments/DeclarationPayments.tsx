import {
  checkStatusLabel,
  formatDate,
  formatPesos,
  totalInClearing,
  totalPaid,
  checkTone,
} from '../../../../lib'
import { Badge, Card } from '../../../atoms'
import { CardHeader, DataItem, EmptyState } from '../../../molecules'
import type { DeclarationPaymentsProps } from './DeclarationPayments.types'

/** Pagos recibidos para la declaración, los cheques sin pagar, el total pagado y el saldo. */
export default function DeclarationPayments({ d, payments, checks }: DeclarationPaymentsProps) {
  const ofThis = payments.filter((p) => p.declarationId === d.id)
  // Los cheques pagados ya están entre los pagos.
  const unpaidChecks = checks.filter((c) => c.declarationId === d.id && c.status !== 'paid')
  const paidAmount = totalPaid(d.id, payments)
  const inClearing = totalInClearing(d.id, checks)

  return (
    <Card>
      <CardHeader
        title="Pagos"
        description={
          d.tax === 'ica'
            ? 'El ICA anual admite pago parcial.'
            : 'Solo el pago total le da efecto a esta declaración.'
        }
      />
      {ofThis.length === 0 && unpaidChecks.length === 0 ? (
        <EmptyState title="No hay pagos registrados" />
      ) : (
        <ul className="divide-y divide-border-subtle">
          {ofThis.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-fg">
                {formatDate(p.date)} · {p.method}
                {p.receipt && (
                  <span className="block text-xs text-fg-muted">
                    Recibo de caja {p.receipt}
                    {p.recordedBy && ` · registró ${p.recordedBy}`}
                  </span>
                )}
              </span>
              <span className="tabular-nums text-fg-strong">{formatPesos(p.value)}</span>
            </li>
          ))}
          {unpaidChecks.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <span className="text-fg">
                {formatDate(c.receiptDate)} · Cheque de gerencia {c.number}, {c.bank}
                <span className="block text-xs text-fg-muted">
                  Recibo de caja {c.receipt} · recibió {c.receivedBy}
                  {c.returnReason && ` · devuelto: ${c.returnReason}`}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <Badge tone={checkTone[c.status]}>{checkStatusLabel[c.status]}</Badge>
                <span
                  className={`tabular-nums ${c.status === 'returned' ? 'text-fg-subtle line-through' : 'text-fg-strong'}`}
                >
                  {formatPesos(c.value)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <dl
        className={`grid gap-4 border-t border-border-subtle p-5 ${inClearing > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}
      >
        <DataItem label="Total pagado">{formatPesos(paidAmount)}</DataItem>
        {inClearing > 0 && <DataItem label="En canje">{formatPesos(inClearing)}</DataItem>}
        <DataItem label="Saldo pendiente">
          {formatPesos(Math.max(d.totalToPay - paidAmount, 0))}
        </DataItem>
      </dl>
    </Card>
  )
}
