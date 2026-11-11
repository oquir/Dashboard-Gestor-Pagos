import type { ReactNode } from 'react'

export interface ModalProps {
  title: string
  description?: ReactNode
  /** Se llama al cerrar con la X, con Esc o al hacer clic fuera de la ventana. */
  close: () => void
  /** Botones al pie de la ventana. */
  footer?: ReactNode
  children: ReactNode
}
