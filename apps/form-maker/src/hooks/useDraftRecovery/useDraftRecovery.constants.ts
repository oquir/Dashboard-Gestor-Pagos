import type { PendingDraft } from './useDraftRecovery.types'

// Constante de modulo: un arreglo nuevo en cada render volveria inestable cualquier dependencia.
export const NOTHING_PENDING: PendingDraft = { draft: null, renamed: [], wasInvalid: false }
