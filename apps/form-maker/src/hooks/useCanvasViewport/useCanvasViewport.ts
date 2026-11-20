/* eslint-disable react-hooks/refs -- el ancla se captura en render a proposito, ver captureAnchor */
import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { getViewportLayout } from '../../lib/canvasViewport/canvasViewport'
import { wheelZoom } from '../../lib/canvasZoom/canvasZoom'
import { useFormStore } from '../../store/formStore'
import type { ViewportLayout } from '../../types/canvasViewport'
import type { CanvasViewportReturn } from '../../types/canvasViewportReturn'
import type { HomedView, PortSize, ViewAnchor } from './useCanvasViewport.types'
import { captureAnchor, readPortSize, restoreAnchor, samePortSize } from './useCanvasViewport.utils'

// Lado DOM del lienzo libre: mide el puerto, dimensiona la raiz con su margen de paneo, aplica el
// zoom, escucha la rueda, vuelve al inicio al cambiar de paso y conserva el centro al cambiar zoom
// o tamano. Las cuentas viven en lib/canvasViewport y lib/canvasZoom.
// El margen negativo compensa que transform no cambia la maquetacion: sin el, al acercar el final
// del formulario queda inalcanzable.
export function useCanvasViewport(): CanvasViewportReturn {
  const zoom: number = useFormStore((state) => state.canvasZoom)
  const panelsCollapsed: boolean = useFormStore(
    (state) => !state.isSidebarOpen && !state.isRightSidebarOpen,
  )
  const canvasKey: string = useFormStore(
    (state) => `${state.activeCanvas.type}:${state.activeCanvas.stepId}`,
  )
  const [content, setContent] = useState<HTMLDivElement | null>(null)
  const [portSize, setPortSize] = useState<PortSize | null>(null)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const portSizeRef = useRef<PortSize | null>(null)
  const pendingAnchor = useRef<ViewAnchor | null>(null)
  const previousZoom = useRef<number>(zoom)
  const homed = useRef<HomedView | null>(null)

  const port: HTMLElement | null = useMemo(
    () => content?.closest<HTMLElement>('[data-canvas-scroll]') ?? null,
    [content],
  )

  // Layout effect: la medida llega antes de pintar.
  useLayoutEffect(() => {
    if (!port) return

    const initial: PortSize = readPortSize(port)
    portSizeRef.current = initial
    // eslint-disable-next-line react-hooks/set-state-in-effect -- primera medida del puerto al montarlo
    setPortSize(initial)

    const observer = new ResizeObserver(() => {
      const next: PortSize = readPortSize(port)
      if (samePortSize(portSizeRef.current, next)) return

      // Plegar paneles o redimensionar mueve el documento: se guarda lo que se miraba; un ancla
      // pendiente se conserva.
      if (content && pendingAnchor.current === null) {
        pendingAnchor.current = captureAnchor(port, content)
      }

      portSizeRef.current = next
      setPortSize(next)
    })

    observer.observe(port)

    return () => observer.disconnect()
  }, [port, content])

  // Sin bucle: offsetHeight no incluye margenes ni cambia con transform.
  useEffect(() => {
    if (!content) return

    const observer = new ResizeObserver(() => {
      const next: number = content.offsetHeight
      setContentHeight((current) => (current === next ? current : next))
    })

    observer.observe(content)

    return () => observer.disconnect()
  }, [content])

  // passive: false para quitarle Ctrl+rueda al zoom de pagina del navegador. En el puerto, para que
  // funcione sobre el margen. En bajo rendimiento los deltas se suman y el zoom se aplica una vez
  // por cuadro.
  useEffect(() => {
    if (!port) return

    let pendingDelta: number = 0
    let frame: number | null = null

    function applyPendingZoom(): void {
      frame = null
      const delta: number = pendingDelta
      pendingDelta = 0

      const state = useFormStore.getState()
      state.setCanvasZoom(wheelZoom(state.canvasZoom, delta))
    }

    function handleWheel(event: WheelEvent): void {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()

      const state = useFormStore.getState()
      if (!state.isLowPerformance) {
        state.setCanvasZoom(wheelZoom(state.canvasZoom, event.deltaY))
        return
      }

      pendingDelta += event.deltaY
      if (frame === null) frame = requestAnimationFrame(applyPendingZoom)
    }

    port.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      port.removeEventListener('wheel', handleWheel)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [port])

  // Con los rects de ANTES del cambio: no mover a un efecto, ahi ya cambiaron. Ancla al centro y no
  // al cursor: el zoom tambien llega por teclado y menu.
  if (previousZoom.current !== zoom) {
    if (content && port) pendingAnchor.current = captureAnchor(port, content)
    previousZoom.current = zoom
  }

  const layout: ViewportLayout | null = portSize
    ? getViewportLayout({
        portWidth: portSize.width,
        portHeight: portSize.height,
        zoom,
        panelsCollapsed,
      })
    : null

  // Despues del commit: antes la raiz tiene el tamano viejo y el navegador recortaria el scroll.
  // zoom y portSize son disparadores, no datos leidos.
  useLayoutEffect(() => {
    const anchor: ViewAnchor | null = pendingAnchor.current
    if (!anchor || !content || !port) return

    pendingAnchor.current = null
    restoreAnchor(port, content, anchor)
  }, [zoom, portSize, content, port])

  // Vuelta al inicio al montar y al cambiar de paso. Va despues del ancla: si coinciden, manda la
  // vuelta al inicio.
  useLayoutEffect(() => {
    if (!layout || !content || !port) return
    if (homed.current?.content === content && homed.current.canvasKey === canvasKey) return

    homed.current = { content, canvasKey }
    pendingAnchor.current = null
    port.scrollTo({ left: layout.homeLeft, top: layout.homeTop })
  }, [layout, content, port, canvasKey])

  const rootStyle: CSSProperties | undefined = layout
    ? {
        width: layout.rootWidth,
        minHeight: layout.rootMinHeight,
        paddingTop: layout.paddingTop,
        paddingBottom: layout.paddingBottom,
      }
    : undefined

  // A escala 1 ni transform ni margen: scale(1) crearia bloque contenedor y contexto de
  // apilamiento. El ancho va siempre.
  const contentStyle: CSSProperties =
    zoom === 1
      ? { width: layout?.documentWidth }
      : {
          width: layout?.documentWidth,
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          marginBottom: contentHeight * (zoom - 1),
        }

  return { contentRef: setContent, rootStyle, contentStyle }
}
