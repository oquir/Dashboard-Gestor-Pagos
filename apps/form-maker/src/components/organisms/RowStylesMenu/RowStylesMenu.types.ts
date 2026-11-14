import type { RowStyles } from '../../../types'

export interface RowStylesMenuProps {
  rowId: string
  styles: RowStyles | undefined
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}
