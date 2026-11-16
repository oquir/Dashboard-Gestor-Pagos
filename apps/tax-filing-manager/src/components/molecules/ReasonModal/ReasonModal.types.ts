import type { ReactNode } from 'react'

export interface ReasonModalProps {
  title: string
  /** Qué pasa al confirmar. */
  description?: ReactNode
  /** Etiqueta del campo; por defecto, "Motivo". */
  label?: string
  placeholder?: string
  /** Texto del botón que confirma, como "Desactivar". */
  confirm: string
  /** El botón que confirma va en rojo: para lo que apaga, quita o rechaza algo. */
  danger?: boolean
  /** Motivo con el que se abre, por ejemplo el que ya tenía. */
  initial?: string
  /** Recibe el motivo escrito, sin espacios en los extremos. */
  onConfirm: (reason: string) => void
  /** Se llama al cancelar o al cerrar la ventana. */
  close: () => void
}
