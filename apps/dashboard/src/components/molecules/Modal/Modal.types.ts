import type { ReactNode } from 'react'

export interface ModalProps {
  title: string
  description?: ReactNode
  /** Se llama al cerrar con la X, con Esc o al hacer clic fuera de la ventana. */
  close: () => void
  /** Botones al pie de la ventana. */
  footer?: ReactNode
  /** Botones de ícono en la cabecera, a la izquierda de la X. */
  actions?: ReactNode
  /** Tamaño de la ventana: `xl` para contenido grande, como un PDF, y `full` para toda la ventana. Por defecto, `md`. */
  size?: 'md' | 'xl' | 'full'
  children: ReactNode
}
