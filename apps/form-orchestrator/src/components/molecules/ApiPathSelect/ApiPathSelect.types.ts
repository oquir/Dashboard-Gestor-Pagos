import type { SchemaLeaf } from '../../../types'

export interface ApiPathSelectProps {
  path: string
  leaves: SchemaLeaf[]
  isOrphan: boolean
  isHostPath: boolean
  onChange: (path: string) => void
}
