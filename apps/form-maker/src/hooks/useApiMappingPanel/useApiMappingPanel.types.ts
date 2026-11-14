import type { CanvasField } from '../../types'
import type { OptionsSetup } from '../../types'
import type { RepeatableGroup } from '../../types'
import type { SchemaLeaf } from '../../types'

export interface UseApiMappingPanelParams {
  field: CanvasField
}

export interface UseApiMappingPanelResult {
  isExcluded: boolean
  path: string
  leaves: SchemaLeaf[]
  isOrphan: boolean
  isHostPath: boolean
  showTypeMismatch: boolean
  resolvedType: string | null
  group: RepeatableGroup | null
  awaitsGroupArrayPath: boolean
  dataSourceCandidates: CanvasField[]
  isAskingOptions: boolean
  setIsAskingOptions: (value: boolean) => void
  handleExcludedToggle: (checked: boolean) => void
  handleOptionsConfirm: (setup: OptionsSetup) => void
  handlePathChange: (nextPath: string) => void
}
