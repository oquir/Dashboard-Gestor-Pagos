import type { OptionsSetup } from '../../../types'

export interface FieldOptionsModalProps {
  fieldTypeLabel: string
  onConfirm: (setup: OptionsSetup) => void
  onCancel: () => void
}
