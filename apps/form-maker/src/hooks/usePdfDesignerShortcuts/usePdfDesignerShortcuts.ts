import { useEffect } from 'react'
import { CANVAS_TOOLS } from '../../constants/canvasTool'
import { stepPdfZoom } from '../../lib/pdfDesign'
import { savePdfDesign } from '../../lib/pdfDesignBank'
import { buildPdfHtml, printPdfHtml } from '../../lib/pdfFile'
import { renderVerticalTextPng } from '../../lib/pdfVerticalText'
import { usePdfDesignStore } from '../../store/pdfDesignStore'
import type { CanvasToolItem, PdfDesignState, PdfSaveResult } from '../../types'
import type { CanvasTool } from '../../types/ui'
import { isEditableTarget, isPointerOverCanvas } from './usePdfDesignerShortcuts.utils'

// Atajos del disenador de PDF: deshacer y rehacer de su historial, Ctrl+S, Ctrl+P (imprime el
// diseno), zoom, Escape, V/M/H y Espacio. Los del formulario se apagan mientras esta abierto. En un
// input, Ctrl+Z es el del texto.
export function usePdfDesignerShortcuts(): void {
  useEffect(() => {
    // La herramienta de antes de sostener Espacio; null mientras Espacio no esta sostenido.
    let toolBeforeSpace: CanvasTool | null = null

    function releaseSpace(): void {
      if (toolBeforeSpace === null) return

      usePdfDesignStore.getState().setTool(toolBeforeSpace)
      toolBeforeSpace = null
    }

    function handleKeyDown(event: KeyboardEvent): void {
      const state: PdfDesignState = usePdfDesignStore.getState()
      const isMod: boolean = event.ctrlKey || event.metaKey

      if (!isMod) {
        if (isEditableTarget(event.target)) return

        if (event.key === 'Escape') {
          state.clearSelection()
          return
        }

        // preventDefault tambien en la repeticion, o el puerto se desplazaria como con un Espacio comun.
        if (event.key === ' ' && isPointerOverCanvas()) {
          event.preventDefault()
          if (event.repeat || toolBeforeSpace !== null) return

          toolBeforeSpace = state.tool
          state.setTool('hand')
          return
        }

        const tool: CanvasToolItem | undefined = CANVAS_TOOLS.find(
          (item) => item.shortcut.toLowerCase() === event.key.toLowerCase(),
        )
        if (tool && !event.altKey) {
          event.preventDefault()
          // Con Espacio sostenido la tecla elige a que herramienta se vuelve al soltarlo.
          if (toolBeforeSpace !== null) toolBeforeSpace = tool.tool
          else state.setTool(tool.tool)
        }
        return
      }

      const key: string = event.key.toLowerCase()

      // Ctrl+P imprime el diseno (el .html que se publica), tambien con foco en un input.
      if (key === 'p' && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        if (!state.design) return
        printPdfHtml(buildPdfHtml(state.design, state.publishedVersion, renderVerticalTextPng))
        return
      }

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

      // Le gana al zoom del navegador; "=" porque sin Shift esa tecla lo reporta.
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

    // El blur cubre soltar Espacio con la ventana en segundo plano, que nunca manda keyup.
    function handleKeyUp(event: KeyboardEvent): void {
      if (event.key !== ' ' || toolBeforeSpace === null) return

      event.preventDefault()
      releaseSpace()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', releaseSpace)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', releaseSpace)
    }
  }, [])
}
