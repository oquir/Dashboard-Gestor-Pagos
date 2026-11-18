import type { StoreApi } from 'zustand'
import { savePdfDesign } from '../../lib/pdfDesignBank'
import type { PdfDesign, PdfDesignState, PdfSaveResult } from '../../types'

interface PendingSave {
  design: PdfDesign
  version: number | null
}

// Escucha el store y guarda cada cambio del autor tras `delayMs` de calma. Devuelve la funcion que
// lo apaga, que ademas guarda lo pendiente. Abrir una plantilla no la guarda: solo un cambio la
// guarda, asi que una plantilla que nadie toco no deja llave en localStorage. Publicar tambien
// cuenta como cambio: la N publicada tiene que sobrevivir a una recarga, o la siguiente la repetiria.
export function startPdfAutosave(store: StoreApi<PdfDesignState>, delayMs: number): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: PendingSave | null = null

  // reportStatus en false cuando lo pendiente es de la plantilla que se acaba de cerrar: su
  // "Guardado" no es el de la que quedo abierta.
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

    // Cambiar de impuesto no es un cambio del autor: es abrir otra plantilla, y no se guarda. Lo
    // pendiente de la anterior si: flush lo escribe en la llave de su propio impuesto.
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
