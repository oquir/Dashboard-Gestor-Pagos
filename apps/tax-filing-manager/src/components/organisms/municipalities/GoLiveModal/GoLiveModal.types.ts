import type { Form } from '../../../../types'

export interface GoLiveModalProps {
  /** El formulario que se activa por primera vez. */
  form: Form
  /** Recibe la fecha elegida. */
  onConfirm: (date: string) => void
  /** Se llama al cancelar o al cerrar la ventana: el formulario sigue apagado. */
  close: () => void
}
