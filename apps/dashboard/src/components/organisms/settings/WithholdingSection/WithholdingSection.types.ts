import type { SettingsEdit, Tax } from '../../../../types'

export interface WithholdingSectionProps extends SettingsEdit {
  taxes: Record<Tax, boolean>
}
