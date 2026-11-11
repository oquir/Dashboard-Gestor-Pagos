import type { CanvasField } from '../../types'
import type { ScriptValidation } from '../../types'

export interface UseFieldScriptEditorParams {
  field: CanvasField
  candidates: CanvasField[]
}

export interface UseFieldScriptEditorResult {
  source: string
  knownNames: Set<string>
  validation: ScriptValidation
  cycle: string | null
  readsSelf: boolean
  dependencies: CanvasField[]
  handleChange: (next: string) => void
}
