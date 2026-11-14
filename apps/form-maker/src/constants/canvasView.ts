import type { TabButtonGroupItem } from '../types'
import type { CanvasViewMode } from '../types'

export const VIEW_MODE_TABS: TabButtonGroupItem<CanvasViewMode>[] = [
  { tab: 'canvas', label: 'Lienzo' },
  { tab: 'json', label: 'JSON' },
  { tab: 'payload', label: 'Payload' },
]
