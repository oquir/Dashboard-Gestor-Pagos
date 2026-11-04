export interface BarraGuardarProps {
  /** El borrador es distinto de lo guardado. */
  cambio: boolean
  hayErrores: boolean
  /** Se acaba de guardar: se muestra `mensajeGuardado`. */
  guardado: boolean
  mensajeGuardado: string
  onDescartar: () => void
  onGuardar: () => void
}
