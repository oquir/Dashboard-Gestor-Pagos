export interface SaveBarProps {
  /** El borrador es distinto de lo guardado. */
  modification: boolean
  hasErrors: boolean
  onDiscard: () => void
  onSave: () => void
}
