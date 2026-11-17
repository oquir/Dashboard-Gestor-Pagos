import type { PdfDesign, PdfMargins, PdfTaxType } from './pdfDesign'

export interface PdfDesignState {
  // null hasta que el diseñador abre la plantilla de un impuesto.
  design: PdfDesign | null
  lastSavedAt: string | null
  // El ultimo autoguardado que fallo (cupo lleno, sobre todo). Se limpia al guardar bien.
  saveError: string | null
  // Trae lo guardado de ese impuesto o empieza en blanco. Reabrir el mismo no hace nada.
  openDesign: (taxType: PdfTaxType) => void
  setMargins: (updates: Partial<PdfMargins>) => void
  markSaved: (savedAt: string) => void
  setSaveError: (error: string) => void
}
