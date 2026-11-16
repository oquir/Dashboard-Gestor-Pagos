import { approvalStatusLabel } from '../../../../lib'
import type { ApprovalsFilter } from './PendingApprovals.types'

export const FILTER_OPTIONS: Record<ApprovalsFilter, string> = {
  all_pending: 'Pendientes',
  ...approvalStatusLabel,
  '': 'Toda aprobación',
}
