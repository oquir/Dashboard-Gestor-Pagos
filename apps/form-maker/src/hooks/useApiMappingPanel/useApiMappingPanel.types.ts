import type { CanvasField } from '../../types'
import type { ConceptValueKind } from '../../types'
import type { OptionsSetup } from '../../types'
import type { PayloadDestination } from '../../types'
import type { RepeatableGroup } from '../../types'
import type { SchemaLeaf } from '../../types'

export interface UseApiMappingPanelParams {
  field: CanvasField
}

export interface UseApiMappingPanelResult {
  destination: PayloadDestination
  disabledDestinations: Partial<Record<PayloadDestination, string>>
  path: string
  leaves: SchemaLeaf[]
  isOrphan: boolean
  isHostPath: boolean
  showTypeMismatch: boolean
  resolvedType: string | null
  group: RepeatableGroup | null
  awaitsGroupArrayPath: boolean
  conceptId: number | undefined
  conceptKind: ConceptValueKind | null
  conceptClash: CanvasField | null
  dataSourceCandidates: CanvasField[]
  isAskingOptions: boolean
  handleDestinationChange: (destination: PayloadDestination) => void
  handleOptionsConfirm: (setup: OptionsSetup) => void
  handleOptionsCancel: () => void
  handlePathChange: (nextPath: string) => void
  handleConceptIdChange: (raw: string) => void
}
