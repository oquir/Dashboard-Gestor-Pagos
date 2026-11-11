export interface SaveBarProps {
  /** El borrador es distinto de lo guardado. */
  modification: boolean
  hasErrors: boolean
  /** Se acaba de guardar: se muestra `mensajeGuardado`. */
  saved: boolean
  savedMessage: string
  onDiscard: () => void
  onSave: () => void
}
