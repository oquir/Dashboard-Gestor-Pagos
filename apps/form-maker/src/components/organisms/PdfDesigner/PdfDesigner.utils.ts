import type { PdfSaveStatus } from './PdfDesigner.types'

export function savedStatus(lastSavedAt: string | null, saveError: string | null): PdfSaveStatus {
  if (saveError) return { tone: 'error', label: 'No se pudo guardar' }
  if (lastSavedAt) {
    return { tone: 'saved', label: `Guardado ${new Date(lastSavedAt).toLocaleTimeString()}` }
  }
  return { tone: 'idle', label: 'Sin cambios guardados' }
}
