import type { DraftLoad, DraftPayload, FieldRename } from '../../types'
import { migrateFieldNames } from '../fieldName'
import { migrateRows } from '../rowLayout'
import { DRAFT_KEY, DRAFT_SCHEMA_VERSION } from './persistence.constants'
import { migrateDraft } from './persistence.migrations'
import { draftPayloadSchema } from './persistence.schema'
import type { LooseDraft } from './persistence.types'

// Borrador en localStorage con version: se migra antes de validar y, si no valida, se pierde entero
// (mejor que un store a medias). Viaja tambien en el export (builderDraft): lib/projectFile usa
// estas piezas.

export function buildDraftPayload(
  payload: Omit<DraftPayload, 'savedAt' | 'schemaVersion'>,
): DraftPayload {
  return {
    ...payload,
    schemaVersion: DRAFT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
  }
}

export function saveDraft(payload: Omit<DraftPayload, 'savedAt' | 'schemaVersion'>): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(buildDraftPayload(payload)))
}

export function loadDraft(): DraftLoad {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) return { status: 'empty' }

  // localStorage es entrada no confiable. Quien borra un invalido es useDraftRecovery, no la carga.
  let stored: unknown
  try {
    stored = JSON.parse(raw)
  } catch {
    return { status: 'invalid' }
  }

  return parseDraft(stored)
}

// Valida un borrador ya parseado (de localStorage o de un archivo). Nunca lanza.
export function parseDraft(stored: unknown): DraftLoad {
  if (typeof stored !== 'object' || stored === null) return { status: 'invalid' }

  try {
    // Migrar antes de validar: al reves se descartaria lo que la migracion puede salvar.
    const parsed = draftPayloadSchema.safeParse(migrateDraft(stored as LooseDraft))
    if (!parsed.success) return { status: 'invalid' }

    const draft = parsed.data as DraftPayload
    // restoreDraft necesita un paso donde aterrizar; sin pasos solo llega un archivo editado a
    // mano.
    if (draft.formSteps.length === 0) return { status: 'invalid' }

    // Un solo conjunto para los dos lienzos: el export los mezcla en un espacio de nombres.
    const takenNames = new Set<string>()
    const renamed: FieldRename[] = []

    const migrated: DraftPayload = {
      ...draft,
      formSteps: draft.formSteps.map((step) => ({
        ...step,
        rows: migrateFieldNames(migrateRows(step.rows), takenNames, renamed),
      })),
      introModal: {
        steps: draft.introModal.steps.map((step) => ({
          ...step,
          rows: migrateFieldNames(migrateRows(step.rows), takenNames, renamed),
        })),
      },
    }

    return { status: 'ok', draft: migrated, renamed }
  } catch {
    return { status: 'invalid' }
  }
}

// Uno mas nuevo no se migra hacia atras: se distingue del invalido para pedir actualizar.
export function isNewerDraft(stored: unknown): boolean {
  if (typeof stored !== 'object' || stored === null) return false

  const version: unknown = (stored as LooseDraft).schemaVersion
  return typeof version === 'number' && version > DRAFT_SCHEMA_VERSION
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY)
}
