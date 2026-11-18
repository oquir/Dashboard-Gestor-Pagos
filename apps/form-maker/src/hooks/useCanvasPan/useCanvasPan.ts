import { useEffect } from 'react'
import { getCanvasScrollPort } from '../../lib'
import type { PanGesture } from './useCanvasPan.types'

// La mano: arrastrar desplaza el puerto del lienzo en los dos ejes. No puede mover nada del
// documento porque mientras dura la herramienta el documento esta inerte (pointer-events-none en
// Canvas) y lo unico que recibe el puntero es la raiz del lienzo.
//
// Es scroll de verdad y no un translate: lo que recorre la mano es lo mismo que recorren la rueda y
// las barras, sin una segunda posicion que mantener sincronizada con la primera.
//
// Sirve a los dos lienzos: el puerto es el que marca data-canvas-scroll, y como el formulario y el
// diseñador de PDF nunca estan montados a la vez, cada uno pone esa marca en el suyo.
export function useCanvasPan(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return

    const found: HTMLElement | null = getCanvasScrollPort()
    if (!found) return

    const port: HTMLElement = found
    let gesture: PanGesture | null = null

    function handlePointerDown(event: PointerEvent): void {
      if (event.button !== 0 || !(event.target instanceof Element)) return

      // Sobre una barra de scroll manda la barra. Se decide por geometria y no por el objetivo
      // (target === port): en el lienzo del formulario la raiz cubre todo y solo la barra caia en el
      // puerto, pero en el del PDF el espacio vacio de la hoja tambien es el puerto y ahi si hay que
      // arrastrar.
      const rect: DOMRect = port.getBoundingClientRect()
      const onScrollbar: boolean =
        event.clientX - rect.left >= port.clientLeft + port.clientWidth ||
        event.clientY - rect.top >= port.clientTop + port.clientHeight
      if (onScrollbar) return

      // La captura va sobre el nodo pulsado y no sobre el puerto: el cursor se toma del elemento
      // que captura, y la mano cerrada (active:cursor-grabbing) la pinta la raiz del lienzo.
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

    // Si la herramienta cambia a mitad del gesto -soltar Espacio con el boton apretado- el cleanup
    // cierra el gesto: sin esto la captura quedaria colgada de un nodo que ya nadie escucha.
    return () => {
      endGesture()
      port.removeEventListener('pointerdown', handlePointerDown)
      port.removeEventListener('pointermove', handlePointerMove)
      port.removeEventListener('pointerup', endGesture)
      port.removeEventListener('pointercancel', endGesture)
    }
  }, [enabled])
}
