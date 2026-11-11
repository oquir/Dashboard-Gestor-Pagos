import type { Formulario } from '../../../../types'

export interface ModalSalidaProduccionProps {
  /** El formulario que se activa por primera vez. */
  formulario: Formulario
  /** Recibe la fecha elegida. */
  alConfirmar: (fecha: string) => void
  /** Se llama al cancelar o al cerrar la ventana: el formulario sigue apagado. */
  cerrar: () => void
}
