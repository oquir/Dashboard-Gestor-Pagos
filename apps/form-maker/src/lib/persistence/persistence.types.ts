// Antes de Zod no se le supone forma (localStorage se edita desde las devtools).
export type LooseDraft = Record<string, unknown>

export type DraftMigration = (draft: LooseDraft) => LooseDraft

export type FieldMigration = (field: LooseDraft) => LooseDraft
