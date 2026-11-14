import type { OrphanBinding } from '../../types'

export interface UsePayloadPreviewCanvasResult {
  summaryJson: string
  orphanBindings: OrphanBinding[]
  copied: boolean
  handleCopy: () => Promise<void>
}
