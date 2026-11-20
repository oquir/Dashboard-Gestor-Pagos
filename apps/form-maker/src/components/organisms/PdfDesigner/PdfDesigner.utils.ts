import type { PdfSaveStatus } from './PdfDesigner.types'

export function savedStatus(lastSavedAt: string | null, saveError: string | null): PdfSaveStatus {
  if (saveError) return { tone: 'error', label: 'No se pudo guardar' }
  if (lastSavedAt) {
    const time: string = new Date(lastSavedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    return { tone: 'saved', label: `Guardado a las ${time}` }
  }
  // "Sin cambios guardados" se leia como "tienes cambios sin guardar" (docs/Plan-PDF-UX-P2.md).
  return { tone: 'idle', label: 'Sin cambios' }
}
