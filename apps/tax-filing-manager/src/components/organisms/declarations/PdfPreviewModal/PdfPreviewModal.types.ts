import type { Declaration } from '../../../../types'

type PdfSource = { d: Declaration; blob?: never } | { d?: never; blob: Blob | Promise<Blob> }

export type PdfPreviewModalProps = PdfSource & {
  /** Título de la ventana; si no va, sale de la declaración. */
  title?: string
  /** Subtítulo; si no va, sale de la declaración. */
  description?: string
  /** Nombre del archivo al descargar; si no va, sale de la declaración. */
  fileName?: string
  /** Abrir el PDF en otra pestaña */
  showOpen?: boolean
  /** Descargar el PDF */
  showDownload?: boolean
  /** Se llama al cerrar con el botón, con la X, con Esc o al hacer clic fuera de la ventana. */
  close: () => void
}
