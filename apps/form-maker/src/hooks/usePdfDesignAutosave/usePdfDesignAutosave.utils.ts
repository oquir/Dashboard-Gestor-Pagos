import type { StoreApi } from 'zustand'
import { savePdfDesign } from '../../lib/pdfDesignBank'
import type { PdfDesign, PdfDesignState, PdfSaveResult } from '../../types'

interface PendingSave {
  design: PdfDesign
  version: number | null
}

// Guarda tras delayMs de calma y devuelve el apagado (que guarda lo pendiente). Abrir una plantilla
// no guarda; publicar si cuenta como cambio, o la N se repetiria tras recargar.
export function startPdfAutosave(store: StoreApi<PdfDesignState>, delayMs: number): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: PendingSave | null = null

  // false si lo pendiente es de la plantilla que se cerro: su "Guardado" no es el de la abierta.
  function flush(reportStatus: boolean): void {
    if (timer !== null) clearTimeout(timer)
    timer = null
    if (pending === null) return

    const result: PdfSaveResult = savePdfDesign(pending.design, new Date(), pending.version)
    pending = null
    if (!reportStatus) return

    if (result.ok) store.getState().markSaved(result.savedAt)
    else store.getState().setSaveError(result.error)
  }

  const unsubscribe = store.subscribe((state, previous) => {
    const changed: boolean =
      state.design !== previous.design || state.publishedVersion !== previous.publishedVersion
    if (!changed || state.design === null) return

    // Cambiar de impuesto es abrir otra plantilla: no se guarda. Lo pendiente de la anterior va a
    // su llave.
    if (previous.design === null || previous.design.taxType !== state.design.taxType) {
      flush(false)
      return
    }

    pending = { design: state.design, version: state.publishedVersion }
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => flush(true), delayMs)
  })

  return () => {
    unsubscribe()
    flush(true)
  }
}
