import { useEffect } from 'react'
import { getCanvasScrollPort } from '../../lib'
import type { PanGesture } from './useCanvasPan.types'

// La mano: arrastrar desplaza el puerto en los dos ejes (el documento esta inerte). Es scroll de
// verdad, no un translate. Sirve a los dos lienzos: el puerto es el que marca data-canvas-scroll.
export function useCanvasPan(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return

    const found: HTMLElement | null = getCanvasScrollPort()
    if (!found) return

    const port: HTMLElement = found
    let gesture: PanGesture | null = null

    function handlePointerDown(event: PointerEvent): void {
      if (event.button !== 0 || !(event.target instanceof Element)) return

      // Sobre una barra manda la barra. Por geometria y no por target: en el PDF el vacio de la
      // hoja tambien es el puerto y ahi si hay que arrastrar.
      const rect: DOMRect = port.getBoundingClientRect()
      const onScrollbar: boolean =
        event.clientX - rect.left >= port.clientLeft + port.clientWidth ||
        event.clientY - rect.top >= port.clientTop + port.clientHeight
      if (onScrollbar) return

      // Captura en el nodo pulsado: el cursor sale del elemento que captura, y la mano cerrada la
      // pinta la raiz.
      event.target.setPointerCapture(event.pointerId)
      gesture = {
        pointerId: event.pointerId,
        target: event.target,
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: port.scrollLeft,
        scrollTop: port.scrollTop,
      }
    }

    function handlePointerMove(event: PointerEvent): void {
      if (!gesture || event.pointerId !== gesture.pointerId) return

      port.scrollLeft = gesture.scrollLeft - (event.clientX - gesture.startX)
      port.scrollTop = gesture.scrollTop - (event.clientY - gesture.startY)
    }

    function endGesture(): void {
      if (!gesture) return

      if (gesture.target.hasPointerCapture(gesture.pointerId)) {
        gesture.target.releasePointerCapture(gesture.pointerId)
      }
      gesture = null
    }

    port.addEventListener('pointerdown', handlePointerDown)
    port.addEventListener('pointermove', handlePointerMove)
    port.addEventListener('pointerup', endGesture)
    port.addEventListener('pointercancel', endGesture)

    // Si la herramienta cambia a mitad del gesto, el cleanup lo cierra: si no, la captura queda
    // colgada.
    return () => {
      endGesture()
      port.removeEventListener('pointerdown', handlePointerDown)
      port.removeEventListener('pointermove', handlePointerMove)
      port.removeEventListener('pointerup', endGesture)
      port.removeEventListener('pointercancel', endGesture)
    }
  }, [enabled])
}
