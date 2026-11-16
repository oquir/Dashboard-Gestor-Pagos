export interface PdfViewerProps {
  /** El PDF que se dibuja. */
  pdf: Blob
  /** Nombre del documento, para que el lector de pantalla anuncie cada página. */
  title: string
}
