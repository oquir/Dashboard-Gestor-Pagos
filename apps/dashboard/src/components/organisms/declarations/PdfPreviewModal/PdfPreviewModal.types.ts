import type { Declaration } from '../../../../types'

export interface PdfPreviewModalProps {
  d: Declaration
  /** Se llama al cerrar con el botón, con la X, con Esc o al hacer clic fuera de la ventana. */
  close: () => void
}
