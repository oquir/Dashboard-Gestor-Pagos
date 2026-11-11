import type { ReactNode } from 'react'

export interface ModalProps {
  title: string
  description?: ReactNode
  /** Se llama al cerrar con la X, con Esc o al hacer clic fuera de la ventana. */
  close: () => void
  /** Botones al pie de la ventana. */
  footer?: ReactNode
  /** Ancho máximo de la ventana: `xl` para contenido grande, como un PDF. Por defecto, `md`. */
  size?: 'md' | 'xl'
  children: ReactNode
}
