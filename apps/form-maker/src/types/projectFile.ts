import type { DraftPayload, FieldRename } from './persistenceTypes'

// A diferencia de DraftLoad el error trae mensaje: quien eligio el archivo necesita saber que hacer.
export type ProjectFileLoad =
  | { status: 'ok'; draft: DraftPayload; renamed: FieldRename[] }
  | { status: 'error'; message: string }

// Se muestra antes de abrir, para confirmar el archivo.
export interface ProjectFileSummary {
  formTypeLabel: string
  stepCount: number
  introStepCount: number
  fieldCount: number
  savedAt: string
}
