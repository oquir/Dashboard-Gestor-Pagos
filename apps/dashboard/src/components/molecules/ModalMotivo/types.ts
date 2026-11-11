import type { ReactNode } from 'react'

export interface ModalMotivoProps {
  titulo: string
  /** Qué pasa al confirmar. */
  descripcion?: ReactNode
  /** Etiqueta del campo; por defecto, "Motivo". */
  etiqueta?: string
  placeholder?: string
  /** Texto del botón que confirma, como "Desactivar". */
  confirmar: string
  /** El botón que confirma va en rojo: para lo que apaga, quita o rechaza algo. */
  peligro?: boolean
  /** Motivo con el que se abre, por ejemplo el que ya tenía. */
  inicial?: string
  /** Recibe el motivo escrito, sin espacios en los extremos. */
  alConfirmar: (motivo: string) => void
  /** Se llama al cancelar o al cerrar la ventana. */
  cerrar: () => void
}
