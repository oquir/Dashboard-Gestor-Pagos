import type { CatalogBank } from './catalog'
import type { PreviewState, RuntimeIssue, RuntimeModel, RuntimeSnapshot } from './formRuntime'

export interface FormPreviewApi {
  model: RuntimeModel
  // Hace las veces del endpoint de catalogos del consumidor.
  catalogBank: CatalogBank
  state: PreviewState
  snapshot: RuntimeSnapshot
  errors: Record<string, string>
  issues: RuntimeIssue[]
  payload: Record<string, unknown>
  revealed: Record<string, boolean>
  setValue: (name: string, value: unknown, groupId?: string, index?: number) => void
  addGroupItem: (groupId: string) => void
  removeGroupItem: (groupId: string, index: number) => void
  // true si esas claves quedaron sin errores.
  validateKeys: (keys: string[]) => boolean
  reset: () => void
}
