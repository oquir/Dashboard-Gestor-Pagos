import { FORM_TYPES } from '../../constants'
import type { DraftLoad, DraftPayload } from '../../types'
import type { ProjectFileLoad, ProjectFileSummary } from '../../types'
import { isNewerDraft, parseDraft } from '../persistence'
import {
  DAMAGED_MESSAGE,
  LEGACY_EXPORT_MESSAGE,
  NEWER_VERSION_MESSAGE,
  NOT_EXPORT_MESSAGE,
  NOT_JSON_MESSAGE,
  UNKNOWN_FORM_TYPE_LABEL,
} from './projectFile.constants'

// Reabrir un export: el proyecto sale de builderDraft; formSchema se ignora (compilado y con
// perdidas). Entrada no confiable: mismas migraciones y esquema que localStorage. Los scripts no se
// pueden sanear.

export function readProjectFile(text: string): ProjectFileLoad {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { status: 'error', message: NOT_JSON_MESSAGE }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { status: 'error', message: NOT_EXPORT_MESSAGE }
  }

  const file: Record<string, unknown> = parsed as Record<string, unknown>
  if (!('projectMeta' in file) || !('formSchema' in file)) {
    return { status: 'error', message: NOT_EXPORT_MESSAGE }
  }

  // Un export sin builderDraft es anterior a el: se pide volver a exportarlo.
  if (file.builderDraft === undefined) {
    return { status: 'error', message: LEGACY_EXPORT_MESSAGE }
  }

  if (isNewerDraft(file.builderDraft)) {
    return { status: 'error', message: NEWER_VERSION_MESSAGE }
  }

  const loaded: DraftLoad = parseDraft(file.builderDraft)
  if (loaded.status !== 'ok') return { status: 'error', message: DAMAGED_MESSAGE }

  return {
    status: 'ok',
    // Todo export salio de un setup terminado: isComplete en false dejaria la app en el asistente.
    draft: { ...loaded.draft, setupConfig: { ...loaded.draft.setupConfig, isComplete: true } },
    renamed: loaded.renamed,
  }
}

export function summarizeProjectFile(draft: DraftPayload): ProjectFileSummary {
  return {
    formTypeLabel:
      FORM_TYPES.find((option) => option.value === draft.setupConfig.formType)?.label ??
      UNKNOWN_FORM_TYPE_LABEL,
    stepCount: draft.formSteps.length,
    introStepCount: draft.introModal.steps.length,
    // Solo los pasos del formulario, igual que el resumen del panel derecho.
    fieldCount: draft.formSteps.reduce(
      (total, step) => total + step.rows.reduce((count, row) => count + row.fields.length, 0),
      0,
    ),
    savedAt: draft.savedAt,
  }
}
