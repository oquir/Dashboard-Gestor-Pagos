import type { ApprovalSituation } from '../../../../lib'
import type { Declaration, ApprovalStatus, FilterValue } from '../../../../types'

/** Una declaración con su aprobación previa. */
export interface DeclarationWithApproval {
  d: Declaration
  a: ApprovalSituation
}

/** Por estado de aprobación; `pendientes`, las que esperan aprobación, dentro o fuera del plazo. */
export type ApprovalsFilter = FilterValue<ApprovalStatus | 'all_pending'>

export interface PendingApprovalsProps {
  /** Lo pendiente primero, por plazo; lo resuelto, de lo más reciente a lo más antiguo. */
  approvals: DeclarationWithApproval[]
  className?: string
}
