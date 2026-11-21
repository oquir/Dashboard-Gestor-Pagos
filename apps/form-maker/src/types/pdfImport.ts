import type { PdfFileRead } from './pdfDesign'

// El archivo que se abriria: el de N mas alta entre los que se pudieron leer.
export interface PdfImportChoice {
  fileName: string
  read: Extract<PdfFileRead, { ok: true }>
  readableCount: number
}

export interface UsePdfImportResult {
  status: string
  choice: PdfImportChoice | null
  // Los que no se pudieron leer, con su motivo.
  failures: string[]
  isReading: boolean
  canOpen: boolean
  pickFiles: (files: File[]) => Promise<void>
  openChosen: () => void
}
