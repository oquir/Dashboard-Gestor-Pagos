import type { ReactNode } from 'react'

export interface ModalProps {
  titulo: string
  descripcion?: ReactNode
  /** Se llama al cerrar con la X, con Esc o al hacer clic fuera de la ventana. */
  cerrar: () => void
  /** Botones al pie de la ventana. */
  pie?: ReactNode
  children: ReactNode
}
