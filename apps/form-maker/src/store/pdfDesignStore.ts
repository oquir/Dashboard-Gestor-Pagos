import { create } from 'zustand'
import { createBlankDesign, normalizeMargins } from '../lib/pdfDesign'
import { loadPdfDesign } from '../lib/pdfDesignBank'
import type { PdfDesignState, PdfMargins, StoredPdfDesign } from '../types'

// El store del diseño del PDF, aparte de useFormStore a proposito: tendra su propio historial de
// deshacer (un temporal de zundo distinto), y deshacer en el PDF no debe tocar el formulario ni al
// reves. Tampoco comparte el borrador: guarda en su propia llave por impuesto (usePdfDesignAutosave).
// Solo lo importa el diseñador, que se carga con React.lazy: store/index.ts no lo reexporta, se
// importa por su ruta.

export const usePdfDesignStore = create<PdfDesignState>()((set, get) => ({
  design: null,
  lastSavedAt: null,
  saveError: null,

  openDesign: (taxType) => {
    if (get().design?.taxType === taxType) return

    const stored: StoredPdfDesign | null = loadPdfDesign(taxType)
    set({
      design: stored ? stored.design : createBlankDesign(taxType),
      lastSavedAt: stored ? stored.savedAt : null,
      saveError: null,
    })
  },

  setMargins: (updates) =>
    set((state) => {
      if (!state.design) return state

      const margins: PdfMargins = normalizeMargins({ ...state.design.margins, ...updates })
      return { design: { ...state.design, margins } }
    }),

  markSaved: (savedAt) => set({ lastSavedAt: savedAt, saveError: null }),

  setSaveError: (error) => set({ saveError: error }),
}))
