import { useEffect, useState } from 'react'
import { getCanvasScrollPort, getFieldElements } from '../../lib'
import { mergeIds, normalizeRect, pointInRect, rectsIntersect } from '../../lib'
import { useFormStore } from '../../store'
import type { SelectionRect } from '../../types'
import { MARQUEE_ACTIVATION_PX } from './useCanvasMarquee.constants'
import type { MarqueeGesture, ScrollPoint } from './useCanvasMarquee.types'
import { clipToPort, scrollOffset, shiftRect } from './useCanvasMarquee.utils'

// Marco de la seleccion multiple: todo suma (clic agrega o quita, el marco agrega, el vacio
// limpia). Vive en el espacio de scroll del puerto, asi el origen no se mueve si la rueda desplaza
// a mitad del gesto. Devuelve el rectangulo en coordenadas de ventana, recortado al puerto.
export function useCanvasMarquee(enabled: boolean): SelectionRect | null {
  const [marquee, setMarquee] = useState<SelectionRect | null>(null)

  useEffect(() => {
    if (!enabled) return

    const found: HTMLElement | null = getCanvasScrollPort()
    if (!found) return

    const port: HTMLElement = found
    let gesture: MarqueeGesture | null = null

    function update(): void {
      if (!gesture) return

      const offset: ScrollPoint = scrollOffset(port)
      const current: ScrollPoint = { x: gesture.clientX + offset.x, y: gesture.clientY + offset.y }

      if (!gesture.active) {
        const distance: number = Math.hypot(
          current.x - gesture.origin.x,
          current.y - gesture.origin.y,
        )
        if (distance < MARQUEE_ACTIVATION_PX) return
        gesture.active = true
      }

      const area: SelectionRect = normalizeRect(
        gesture.origin.x,
        gesture.origin.y,
        current.x,
        current.y,
      )
      const hits: string[] = []

      // getBoundingClientRect ya viene escalado, igual que el marco: no hace falta la escala.
      for (const element of getFieldElements()) {
        const fieldId: string | undefined = element.dataset.fieldId

        if (fieldId && rectsIntersect(area, shiftRect(element.getBoundingClientRect(), offset))) {
          hits.push(fieldId)
        }
      }

      useFormStore.getState().setFieldSelection(mergeIds(gesture.base, hits))
      setMarquee(clipToPort(port, shiftRect(area, { x: -offset.x, y: -offset.y })))
    }

    function endGesture(): void {
      if (!gesture) return

      if (gesture.target.hasPointerCapture(gesture.pointerId)) {
        gesture.target.releasePointerCapture(gesture.pointerId)
      }
      gesture = null
      setMarquee(null)
    }

    function handlePointerDown(event: PointerEvent): void {
      // Sobre una barra de scroll el objetivo es el puerto: ahi manda la barra.
      if (event.button !== 0 || event.target === port || !(event.target instanceof Element)) return

      const offset: ScrollPoint = scrollOffset(port)

      event.target.setPointerCapture(event.pointerId)
      gesture = {
        pointerId: event.pointerId,
        target: event.target,
        origin: { x: event.clientX + offset.x, y: event.clientY + offset.y },
        clientX: event.clientX,
        clientY: event.clientY,
        base: useFormStore.getState().selectedFieldIds,
        active: false,
      }
    }

    function handlePointerMove(event: PointerEvent): void {
      if (!gesture || event.pointerId !== gesture.pointerId) return

      gesture.clientX = event.clientX
      gesture.clientY = event.clientY
      update()
    }

    function handlePointerUp(event: PointerEvent): void {
      if (!gesture || event.pointerId !== gesture.pointerId) return

      const wasMarquee: boolean = gesture.active
      endGesture()
      if (wasMarquee) return

      // Sin arrastre fue un clic. Por rects y no elementsFromPoint, que ignora los nodos
      // pointer-events-none.
      const hit: HTMLElement | undefined = getFieldElements().find((element) =>
        pointInRect(event.clientX, event.clientY, element.getBoundingClientRect()),
      )
      const fieldId: string | undefined = hit?.dataset.fieldId
      const state = useFormStore.getState()

      if (fieldId) state.toggleFieldSelection(fieldId)
      else state.selectField(null)
    }

    // Escape restaura la seleccion inicial. En captura y sin propagar: el Escape global la
    // limpiaria.
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape' || !gesture) return

      event.preventDefault()
      event.stopPropagation()
      useFormStore.getState().setFieldSelection(gesture.base)
      endGesture()
    }

    port.addEventListener('pointerdown', handlePointerDown)
    port.addEventListener('pointermove', handlePointerMove)
    port.addEventListener('pointerup', handlePointerUp)
    port.addEventListener('pointercancel', endGesture)
    port.addEventListener('scroll', update, { passive: true })
    window.addEventListener('keydown', handleKeyDown, true)

    return () => {
      endGesture()
      port.removeEventListener('pointerdown', handlePointerDown)
      port.removeEventListener('pointermove', handlePointerMove)
      port.removeEventListener('pointerup', handlePointerUp)
      port.removeEventListener('pointercancel', endGesture)
      port.removeEventListener('scroll', update)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [enabled])

  return marquee
}
