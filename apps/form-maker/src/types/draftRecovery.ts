import type { DraftPayload, FieldRename } from './persistenceTypes'

export type DraftRecoveryStatus = 'loading' | 'recovering' | 'ready'

export interface DraftRecovery {
  status: DraftRecoveryStatus
  draft: DraftPayload | null
  // Nombres repetidos desambiguados al cargar; el modal los lista para revisar formulas.
  renamed: FieldRename[]
  // El borrador no valido y se borro. Dura hasta que el asistente termina y muestra el aviso.
  wasInvalid: boolean
  restore: () => void
  discard: () => void
}
