import { useEffect } from 'react'
import { CANVAS_TOOLS } from '../../constants/canvasTool'
import { ZOOM_DEFAULT } from '../../constants/canvasZoom'
import { STEP_NAVIGATION_OFFSETS } from '../../constants/stepNavigation'
import { zoomIn, zoomOut } from '../../lib/canvasZoom/canvasZoom'
import { saveDraft } from '../../lib/persistence/persistence'
import { adjacentStep, orderedSteps } from '../../lib/stepNavigation/stepNavigation'
import { getActiveRows, getAllFields, useFormStore } from '../../store/formStore'
import type { FormState } from '../../types/formStoreTypes'
import type { CanvasTarget } from '../../types/placement'
import type { CanvasTool, CanvasToolItem } from '../../types/ui'
import { isEditableTarget, isPointerOverCanvas } from './useKeyboardShortcuts.utils'

// Atajos globales del constructor. Ctrl/Cmd+S guarda el borrador; se monta en App para funcionar
// con el simulador abierto. Zoom, herramientas y seleccion solo con el lienzo a la vista.
export function useKeyboardShortcuts() {
  useEffect(() => {
    // La herramienta de antes de sostener Espacio; null mientras Espacio no esta sostenido.
    let toolBeforeSpace: CanvasTool | null = null

    function releaseSpace(): void {
      if (toolBeforeSpace === null) return

      useFormStore.getState().setCanvasTool(toolBeforeSpace)
      toolBeforeSpace = null
    }

    function handleKeyDown(event: KeyboardEvent): void {
      const isMod = event.ctrlKey || event.metaKey
      const state: FormState = useFormStore.getState()

      // Teclas sueltas: el camino de teclado al cromo que solo aparece con hover.
      if (!isMod) {
        if (state.isSimulatorOpen || state.isPdfDesignerOpen || !state.setupConfig.isComplete) {
          return
        }
        if (isEditableTarget(event.target)) return

        const isCanvasView: boolean = state.canvasViewMode === 'canvas'

        // Espacio sostenido es la mano temporal (Figma), solo con el puntero sobre el lienzo: en un
        // boton de los paneles, Espacio lo activa. preventDefault tambien en la repeticion.
        if (event.key === ' ' && isCanvasView && isPointerOverCanvas()) {
          event.preventDefault()
          if (event.repeat || toolBeforeSpace !== null) return

          toolBeforeSpace = state.canvasTool
          state.setCanvasTool('hand')
          return
        }

        const tool: CanvasToolItem | undefined = CANVAS_TOOLS.find(
          (item) => item.shortcut.toLowerCase() === event.key.toLowerCase(),
        )

        if (tool && isCanvasView && !event.altKey) {
          event.preventDefault()
          // Con Espacio sostenido la tecla elige a que herramienta se vuelve al soltarlo.
          if (toolBeforeSpace !== null) toolBeforeSpace = tool.tool
          else state.setCanvasTool(tool.tool)
          return
        }

        if (state.selectedFieldIds.length === 0) return

        // Escape cierra el menu contextual y ademas deselecciona: los dos son cancelar.
        if (event.key === 'Escape') {
          state.selectField(null)
          return
        }

        // Sin confirmacion aunque sean varios: Ctrl+Z los recupera.
        if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault()
          state.removeFields(state.selectedFieldIds)
        }
        return
      }

      const key = event.key.toLowerCase()

      if (key === 's') {
        event.preventDefault()
        // Con el diseñador de PDF abierto, Ctrl+S guarda el PDF (usePdfDesignerShortcuts).
        if (!state.setupConfig.isComplete || state.isPdfDesignerOpen) return

        saveDraft({
          formSteps: state.formSteps,
          introModal: state.introModal,
          formScript: state.formScript,
          setupConfig: state.setupConfig,
        })
        state.markSaved()
        return
      }

      // Con el simulador o el PDF no hay lienzo del formulario: ni pasos, ni deshacer, ni
      // seleccion, ni zoom.
      if (state.isSimulatorOpen || state.isPdfDesignerOpen) return

      // Ctrl+flecha, de a uno. Solo Ctrl: Alt+flecha es atras del navegador, Ctrl+Alt gira la
      // pantalla en equipos Intel y Cmd+flecha es atras en Mac. Solo en el lienzo: en JSON o
      // Payload cambiar de paso no se ve.
      const stepOffset: 1 | -1 | undefined = STEP_NAVIGATION_OFFSETS[event.key]

      if (stepOffset !== undefined && event.ctrlKey && !event.metaKey && !event.altKey) {
        if (event.shiftKey || !state.setupConfig.isComplete) return
        if (state.canvasViewMode !== 'canvas') return
        if (isEditableTarget(event.target)) return

        event.preventDefault()
        // No a mitad de un arrastre: desmontaria lo que cuelga del puntero.
        if (state.rowDrag !== null || state.draggingFieldId !== null) return

        const steps: CanvasTarget[] = orderedSteps(state.formSteps, state.introModal.steps)
        const next: CanvasTarget | null = adjacentStep(steps, state.activeCanvas, stepOffset)
        if (next) state.setActiveCanvas(next)
        return
      }

      // Dentro de un input o del editor de scripts manda su propio historial de texto.
      if (key === 'z' || key === 'y') {
        if (!state.setupConfig.isComplete || isEditableTarget(event.target)) return

        event.preventDefault()
        if (key === 'y' || event.shiftKey) state.redo()
        else state.undo()
        return
      }

      // Dentro de un input, o fuera del lienzo, queda el Ctrl+A del navegador.
      if (key === 'a') {
        if (!state.setupConfig.isComplete || state.canvasViewMode !== 'canvas') return
        if (isEditableTarget(event.target)) return

        event.preventDefault()
        state.setFieldSelection(getAllFields(getActiveRows(state)).map((field) => field.id))
        return
      }

      // El zoom del lienzo se queda con el atajo del navegador (la pagina es fija). "=" ademas de
      // "+": sin Shift esa tecla reporta "=".
      if (key === '+' || key === '=') {
        event.preventDefault()
        state.setCanvasZoom(zoomIn(state.canvasZoom))
      } else if (key === '-') {
        event.preventDefault()
        state.setCanvasZoom(zoomOut(state.canvasZoom))
      } else if (key === '0') {
        event.preventDefault()
        state.setCanvasZoom(ZOOM_DEFAULT)
      }
    }

    // El blur cubre soltar Espacio con la ventana en segundo plano (nunca llega keyup).
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
