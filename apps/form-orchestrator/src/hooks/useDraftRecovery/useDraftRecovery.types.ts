import type { DraftPayload, FieldRename } from '../../types'

export interface PendingDraft {
  draft: DraftPayload | null
  renamed: FieldRename[]
  wasInvalid: boolean
}
