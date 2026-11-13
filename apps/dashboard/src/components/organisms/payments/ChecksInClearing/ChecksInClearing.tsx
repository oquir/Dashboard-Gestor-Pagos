import { Danger, TickCircle } from 'reicon-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { formatDate, formatPesos, RETURNED_CHECK_PENALTY } from '../../../../lib'
import { useData } from '../../../../store'
import { Button, Card, Textarea } from '../../../atoms'
import { Notice, Field, CardHeader, EmptyState } from '../../../molecules'
import type { ChecksInClearingProps, Resolved } from './ChecksInClearing.types'

/**
 * Cheques de gerencia recibidos en la ventanilla que el banco aún no ha pagado. Si los paga, cuentan
 * como pago con la fecha en que se recibieron; si los devuelve, la declaración vuelve a tener saldo.
 */
export default function ChecksInClearing({ checks, canResolve }: ChecksInClearingProps) {
  const confirmCheck = useData((s) => s.confirmCheck)
  const returnCheck = useData((s) => s.returnCheck)
  const [returning, setReturning] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [isResolved, setIsResolved] = useState<Resolved | null>(null)

  const resolve = (row: Resolved['row'], status: Resolved['status']) => {
    if (status === 'paid') confirmCheck(row.c.id)
    else returnCheck(row.c.id, reason.trim())
    setIsResolved({ row, status })
    setReturning(null)
    setReason('')
  }

  return (
    <Card>
      <CardHeader
        title="Cheques en canje"
        description="Cheques de gerencia recibidos en la ventanilla. Cuentan como pago, con la fecha en que se recibieron, cuando se confirma que el banco los pagó."
      />
      {isResolved && (
        <div className="px-5 pt-4">
          {isResolved.status === 'paid' ? (
            <Notice tone="success" icon={TickCircle} role="status">
              Se confirmó el cheque {isResolved.row.c.number}: {formatPesos(isResolved.row.c.value)}{' '}
              quedan como pago de la declaración {isResolved.row.d.number} con fecha del{' '}
              {formatDate(isResolved.row.c.receiptDate)}.
            </Notice>
          ) : (
            <Notice tone="alert" icon={Danger} role="status">
              <p className="font-medium">
                Se marcó como devuelto el cheque {isResolved.row.c.number}. La declaración{' '}
                {isResolved.row.d.number} vuelve a quedar con saldo
                {isResolved.row.d.tax === 'ica'
                  ? '.'
                  : ', y no tiene efecto mientras no se pague completa.'}
              </p>
              <p className="mt-0.5">
                El art. 731 del Código de Comercio fija una sanción del{' '}
                {RETURNED_CHECK_PENALTY * 100} % del valor del cheque devuelto sin causa
                justificada: {formatPesos(isResolved.row.c.value * RETURNED_CHECK_PENALTY)}. Revisa
                cómo la aplica el estatuto del municipio; el aplicativo no la liquida.
              </p>
            </Notice>
          )}
        </div>
      )}
      {checks.length === 0 ? (
        <EmptyState title="No hay cheques en canje" />
      ) : (
        <ul className="divide-y divide-border-subtle">
          {checks.map((row) => {
            const { c, d, name } = row
            return (
              <li key={c.id} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-fg-strong">{name}</p>
                    <p className="text-fg-soft">
                      Cheque {c.number}, {c.bank} · declaración{' '}
                      <Link
                        to={`/declaraciones/${d.id}`}
                        className="font-medium text-fg-strong hover:text-brand-fg"
                      >
                        {d.number}
                      </Link>
                    </p>
                    <p className="text-xs text-fg-muted">
                      Recibido el {formatDate(c.receiptDate)} por {c.receivedBy} · recibo de caja{' '}
                      {c.receipt}
                    </p>
                  </div>
                  <p className="tabular-nums font-medium text-fg-strong">{formatPesos(c.value)}</p>
                </div>
                {canResolve && returning !== c.id && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => resolve(row, 'paid')}>
                      Confirmar pago
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setReturning(c.id)
                        setReason('')
                      }}
                    >
                      Marcar devuelto
                    </Button>
                  </div>
                )}
                {returning === c.id && (
                  <div className="space-y-3">
                    <Field label="Motivo de la devolución">
                      <Textarea
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ej.: el banco informa que el cheque presenta enmendaduras."
                      />
                    </Field>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        disabled={!reason.trim()}
                        onClick={() => resolve(row, 'returned')}
                      >
                        Confirmar devolución
                      </Button>
                      <Button variant="ghost" onClick={() => setReturning(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
