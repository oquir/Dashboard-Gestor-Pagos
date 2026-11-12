import type { ReactNode } from 'react'
import type { DisabledForm } from '../../../types'

export interface DisabledNoticeProps {
  /** El motivo, la fecha y quién lo desactivó. */
  disabled: DisabledForm
  /** Reemplaza la línea de fecha y autor, por ejemplo "Se desactiva al guardar los cambios.". */
  meta?: string
  /** Acción a la derecha del título, como "Cambiar" en Configuración. */
  action?: ReactNode
  /** Lo que se muestra en lugar del motivo si está vacío, por ejemplo su error de validación. */
  missingReason?: string
}
