import type { SettingsEdit, Tax } from '../../../../types'

export interface PriorApprovalSectionProps extends SettingsEdit {
  taxes: Tax[]
}
