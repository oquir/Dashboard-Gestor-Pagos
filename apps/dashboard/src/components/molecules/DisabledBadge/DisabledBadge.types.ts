import type { DisabledForm } from '../../../types'

export interface DisabledBadgeProps {
  /** El motivo, la fecha y quién lo desactivó. */
  disabled: DisabledForm
  /** Reemplaza la línea de fecha y autor, por ejemplo "Se desactiva al guardar los cambios.". */
  meta?: string
}
