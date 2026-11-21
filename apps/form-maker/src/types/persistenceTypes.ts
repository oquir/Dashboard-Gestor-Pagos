import type { FormStep, IntroModalState } from './formStructure'
import type { SetupConfig } from './setup'

export interface DraftPayload {
  schemaVersion: number
  formSteps: FormStep[]
  introModal: IntroModalState
  formScript: string
  setupConfig: SetupConfig
  savedAt: string
}

export interface FieldRename {
  from: string
  to: string
  label: string
}

// vacio es normal; invalido hay que borrarlo y avisarlo.
export type DraftLoad =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'ok'; draft: DraftPayload; renamed: FieldRename[] }
