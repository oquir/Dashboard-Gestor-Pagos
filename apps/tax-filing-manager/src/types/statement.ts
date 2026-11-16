import type { ApprovalSituation } from '../lib/rules'
import type { Check, Declaration, Payment, PaymentStatus } from './domain'

/** Declaración vigente del contribuyente en su estado de cuenta. */
export interface StatementRow {
  d: Declaration
  status: PaymentStatus
  paidAmount: number
  /** Lo que está en cheques de gerencia en canje. */
  inClearing: number
  /** Es deuda: se puede pagar (no espera ni perdió la aprobación previa) y tiene valor a pagar. */
  payable: boolean
  /** Lo que falta por pagar; 0 si no es deuda. */
  balance: number
  approval?: ApprovalSituation
  /** Solicitud de corrección a la baja que espera respuesta: mientras tanto esta declaración sigue vigente. */
  pendingCorrection?: Declaration
  /** Pago en exceso que dejó una corrección a la baja. */
  excess: number
}

/** Un movimiento del historial: un pago, o un cheque que aún no es pago (en canje o devuelto). */
export type StatementMovement =
  { kind: 'payment'; p: Payment; d: Declaration } | { kind: 'check'; c: Check; d: Declaration }

export interface AccountStatement {
  /** La declaración más reciente: de ella salen el nombre y los datos del contribuyente. */
  latest: Declaration
  ica: StatementRow[]
  withholdings: StatementRow[]
  movements: StatementMovement[]
  /** Solo del ICA y solo de lo que es deuda. */
  totals: { toPay: number; paid: number; balance: number }
}
