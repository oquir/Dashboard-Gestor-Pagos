import type { DraftPayload, FieldRename } from '../../../types'

export interface DraftRecoveryModalProps {
  draft: DraftPayload
  renamed: FieldRename[]
  onRestore: () => void
  onDiscard: () => void
}
