import type { Check, Declaration, Payment } from '../../../../types'

export interface DeclarationPaymentsProps {
  d: Declaration
  payments: Payment[]
  checks: Check[]
}
