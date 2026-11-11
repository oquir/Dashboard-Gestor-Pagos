import type { Declaration } from '../../../../types'

export interface DeclarationSelectionProps {
  declarations: Declaration[]
  removeItem: () => void
}
