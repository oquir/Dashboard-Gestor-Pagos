import { useEffect } from 'react'
import { stepPdfZoom } from '../../lib/pdfDesign'
import { savePdfDesign } from '../../lib/pdfDesignBank'
import { usePdfDesignStore } from '../../store/pdfDesignStore'
import type { PdfDesignState, PdfSaveResult } from '../../types'
import { isEditableTarget } from './usePdfDesignerShortcuts.utils'

// Los atajos del diseñador de PDF, mientras esta montado: Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z sobre el
// historial del PDF (no el del formulario), Ctrl+S guarda ya mismo, Ctrl + / - / 0 hacen zoom en el
// lienzo y Escape suelta la seleccion. Los
// del formulario se apagan con el diseñador abierto (useKeyboardShortcuts).
//
// Dentro de un input o un textarea, Ctrl+Z es el deshacer del texto: el del diseño no se mete a
// mitad de una palabra. Un clic en el lienzo saca el foco del input (queda en el body), asi que
// despues de tocar una celda manda el del diseño.
export function usePdfDesignerShortcuts(): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const state: PdfDesignState = usePdfDesignStore.getState()
      const isMod: boolean = event.ctrlKey || event.metaKey

      if (!isMod) {
        if (event.key === 'Escape' && !isEditableTarget(event.target)) state.clearSelection()
        return
      }

      const key: string = event.key.toLowerCase()

      if (key === 's') {
        event.preventDefault()
        if (!state.design) return
        const result: PdfSaveResult = savePdfDesign(state.design)
        if (result.ok) state.markSaved(result.savedAt)
        else state.setSaveError(result.error)
        return
      }

      if ((key === 'z' || key === 'y') && !isEditableTarget(event.target)) {
        event.preventDefault()
        if (key === 'y' || event.shiftKey) state.redo()
        else state.undo()
        return
      }

      // El zoom del lienzo le gana al del navegador, como en el formulario: "=" ademas de "+"
      // porque sin Shift es lo que reporta esa tecla.
      if (key === '+' || key === '=') {
        event.preventDefault()
        state.setZoom(stepPdfZoom(state.zoom, 1))
      } else if (key === '-') {
        event.preventDefault()
        state.setZoom(stepPdfZoom(state.zoom, -1))
      } else if (key === '0') {
        event.preventDefault()
        state.setZoom(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
