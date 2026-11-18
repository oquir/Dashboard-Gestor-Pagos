import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { PDF_CANVAS_CLASS } from '../../../../constants'
import { wheelPdfZoom } from '../../../../lib/pdfDesign'
import { selectedCellIds } from '../../../../lib/pdfDesignEdit'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import { PdfSheetView } from '../PdfSheetView'
import { CANVAS_CSS } from './PdfCanvas.constants'
import type { CellDrag, CellHit, PendingZoom, ZoomAnchor } from './PdfCanvas.types'
import { cellOf, restoreZoomAnchor, scrollerOf } from './PdfCanvas.utils'

// Las hojas del diseño, todas dentro de UN shadow root. Por que: el HTML libre puede traer su
// <style> (decidido en docs/Pendientes-PDF.md §2.1), y en el documento de la app ese <style> le
// cambiaria la cara a FormMaker entero. Adentro del shadow root solo alcanza a las hojas, y como
// todas comparten el mismo root, un <style> de la hoja 1 vale tambien en la 2, igual que en el HTML
// final, que es un solo documento.
//
// React escucha los eventos en el contenedor del portal, asi que los clics de adentro llegan a sus
// manejadores sin nada especial. Tailwind no entra: las clases del lienzo las define CANVAS_CSS.
export function PdfCanvas() {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)
  const design = usePdfDesignStore((state) => state.design)
  const selection = usePdfDesignStore((state) => state.selection)
  const activeSheetId = usePdfDesignStore((state) => state.activeSheetId)
  const selectCell = usePdfDesignStore((state) => state.selectCell)
  const selectBlock = usePdfDesignStore((state) => state.selectBlock)
  const setActiveSheet = usePdfDesignStore((state) => state.setActiveSheet)
  const clearSelection = usePdfDesignStore((state) => state.clearSelection)
  const zoom = usePdfDesignStore((state) => state.zoom)
  const tool = usePdfDesignStore((state) => state.tool)
  const dragRef = useRef<CellDrag | null>(null)
  // Tras un arrastre entre celdas el navegador manda un clic al ancestro comun (la fila), que sube
  // hasta el papel y lo trataria como "clic en la hoja": limpiaria la seleccion recien armada. Este
  // flag se lo salta una vez; el siguiente pointerdown lo baja, por si el clic nunca llego.
  const swallowClickRef = useRef<boolean>(false)
  const anchorRef = useRef<ZoomAnchor | null>(null)
  const pendingRef = useRef<PendingZoom | null>(null)

  // attachShadow solo se puede llamar una vez por elemento: si ya tiene, se reusa.
  const hostRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setShadowRoot(node.shadowRoot ?? node.attachShadow({ mode: 'open' }))
  }, [])

  // Ctrl + rueda acerca con el punto bajo el cursor quieto. Sin esto el navegador haria su propio
  // zoom de pagina, que agranda tambien la barra lateral.
  useEffect(() => {
    const port: HTMLElement | null = scrollerOf(shadowRoot)
    if (!port) return
    function handleWheel(event: WheelEvent): void {
      if (!port) return
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const rect: DOMRect = port.getBoundingClientRect()
      anchorRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      const state = usePdfDesignStore.getState()
      state.setZoom(wheelPdfZoom(state.zoom, event.deltaY))
    }
    port.addEventListener('wheel', handleWheel, { passive: false })
    return () => port.removeEventListener('wheel', handleWheel)
  }, [shadowRoot])

  // El scroll se anota en el momento del cambio, antes de que React pinte: despues, al alejar, el
  // navegador ya lo habria recortado al contenido mas chico. Sin ancla (botones, teclado), el centro.
  useEffect(() => {
    const port: HTMLElement | null = scrollerOf(shadowRoot)
    if (!port) return
    return usePdfDesignStore.subscribe((state, previous) => {
      if (state.zoom === previous.zoom) return
      const anchor: ZoomAnchor = anchorRef.current ?? {
        x: port.clientWidth / 2,
        y: port.clientHeight / 2,
      }
      anchorRef.current = null
      pendingRef.current = {
        ratio: state.zoom / previous.zoom,
        anchor,
        left: port.scrollLeft,
        top: port.scrollTop,
      }
    })
  }, [shadowRoot])

  // zoom va como disparador: el efecto corre despues de pintar las hojas con el zoom nuevo.
  useLayoutEffect(() => {
    const pending: PendingZoom | null = pendingRef.current
    const port: HTMLElement | null = scrollerOf(shadowRoot)
    if (!port || !pending) return
    pendingRef.current = null
    restoreZoomAnchor(port, pending)
  }, [zoom, shadowRoot])

  // El arrastre de la seleccion multiple termina donde sea que se suelte el boton, no solo sobre una
  // celda; y cambiar de herramienta a medio gesto lo cancela.
  useEffect(() => {
    function endDrag(): void {
      if (dragRef.current?.started) swallowClickRef.current = true
      dragRef.current = null
    }
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    return () => {
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [])

  useEffect(() => {
    dragRef.current = null
  }, [tool])

  // Seleccion multiple: presionar en una celda y llegar a otra de LA MISMA tabla arma el rectangulo
  // entre las dos (la seleccion es siempre un rectangulo dentro de una tabla). Sin cruzar a otra
  // celda es un clic, que extiende desde donde estaba (ver onSelectCell mas abajo).
  function handleDocPointerDown(event: ReactPointerEvent<HTMLDivElement>): void {
    swallowClickRef.current = false
    if (tool !== 'select' || event.button !== 0) return

    const hit: CellHit | null = cellOf(event.target)
    dragRef.current = hit ? { ...hit, started: false, last: hit.cellId } : null
  }

  function handleDocPointerOver(event: ReactPointerEvent<HTMLDivElement>): void {
    const drag: CellDrag | null = dragRef.current
    if (!drag) return

    const hit: CellHit | null = cellOf(event.target)
    if (!hit || hit.tableId !== drag.tableId || hit.cellId === drag.last) return

    // La primera vez fija el ancla en la celda donde se presiono; despues solo mueve el foco.
    if (!drag.started) {
      selectCell(drag.tableId, drag.cellId, false)
      drag.started = true
    }
    selectCell(hit.tableId, hit.cellId, true)
    drag.last = hit.cellId
  }

  const selectedIds: ReadonlySet<string> = useMemo(
    () => new Set(design ? selectedCellIds(design, selection) : []),
    [design, selection],
  )
  const selectedBlockId: string | null = selection?.kind === 'block' ? selection.blockId : null

  return (
    <div ref={hostRef}>
      {shadowRoot &&
        design &&
        createPortal(
          <>
            <style>{CANVAS_CSS}</style>
            <div
              className={PDF_CANVAS_CLASS.doc}
              data-tool={tool}
              onPointerDown={handleDocPointerDown}
              onPointerOver={handleDocPointerOver}
            >
              {design.sheets.map((sheet, index) => (
                <PdfSheetView
                  key={sheet.id}
                  sheet={sheet}
                  design={design}
                  index={index}
                  total={design.sheets.length}
                  isActive={sheet.id === activeSheetId}
                  zoom={zoom}
                  selectedIds={selectedIds}
                  selectedBlockId={selectedBlockId}
                  onActivate={() => {
                    if (swallowClickRef.current) {
                      swallowClickRef.current = false
                      return
                    }
                    setActiveSheet(sheet.id)
                    clearSelection()
                  }}
                  onSelectCell={(tableId, cellId, extend) =>
                    selectCell(tableId, cellId, extend || tool === 'select')
                  }
                  onSelectBlock={selectBlock}
                />
              ))}
            </div>
          </>,
          shadowRoot,
        )}
    </div>
  )
}
