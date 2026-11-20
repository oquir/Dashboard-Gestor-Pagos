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
import { fitPdfZoom, pdfStyleSheet, wheelPdfZoom } from '../../../../lib/pdfDesign'
import { selectedCellIds } from '../../../../lib/pdfDesignEdit'
import { useFormStore } from '../../../../store'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import { PdfSheetView } from '../PdfSheetView'
import { CANVAS_CSS } from './PdfCanvas.constants'
import type { CellDrag, CellHit, PendingZoom, ZoomAnchor } from './PdfCanvas.types'
import { cellOf, restoreZoomAnchor, scrollerOf } from './PdfCanvas.utils'

// Todas las hojas en UN shadow root: el <style> del HTML libre no alcanza a FormMaker y vale para
// todas las hojas, como en el HTML final.
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
  const isLowPerformance = useFormStore((state) => state.isLowPerformance)
  const dragRef = useRef<CellDrag | null>(null)
  // Tras un arrastre entre celdas el navegador manda un clic a la fila, que limpiaria la seleccion:
  // este flag lo salta una vez.
  const swallowClickRef = useRef<boolean>(false)
  const anchorRef = useRef<ZoomAnchor | null>(null)
  const pendingRef = useRef<PendingZoom | null>(null)

  // attachShadow solo se puede llamar una vez por elemento: si ya tiene, se reusa.
  const hostRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setShadowRoot(node.shadowRoot ?? node.attachShadow({ mode: 'open' }))
  }, [])

  // Al abrir, ajusta al ancho. Va antes de la suscripcion de abajo: asi este zoom no anota ancla y
  // la vista arranca arriba.
  const didFitRef = useRef<boolean>(false)
  useEffect(() => {
    const port: HTMLElement | null = scrollerOf(shadowRoot)
    if (!port || didFitRef.current) return
    didFitRef.current = true
    usePdfDesignStore.getState().setZoom(fitPdfZoom(port.clientWidth))
  }, [shadowRoot])

  // Ctrl+rueda acerca sobre el cursor; sin esto el navegador haria zoom de pagina.
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

  // El scroll se anota al cambiar, antes de pintar: despues, al alejar, ya estaria recortado. Sin
  // ancla, el centro.
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

  // zoom como disparador: corre despues de pintar con el zoom nuevo.
  useLayoutEffect(() => {
    const pending: PendingZoom | null = pendingRef.current
    const port: HTMLElement | null = scrollerOf(shadowRoot)
    if (!port || !pending) return
    pendingRef.current = null
    restoreZoomAnchor(port, pending)
  }, [zoom, shadowRoot])

  // El arrastre termina donde se suelte; cambiar de herramienta lo cancela.
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

  // Presionar en una celda y llegar a otra de la misma tabla arma el rectangulo; sin cruzar es un
  // clic.
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
  const designCss: string = useMemo(() => (design ? pdfStyleSheet(design) : ''), [design])

  return (
    <div ref={hostRef}>
      {shadowRoot &&
        design &&
        createPortal(
          <>
            <style>{CANVAS_CSS}</style>
            {/* El mismo <style> que lleva el .html. */}
            <style>{designCss}</style>
            <div
              className={PDF_CANVAS_CLASS.doc}
              data-tool={tool}
              data-low-performance={isLowPerformance ? '' : undefined}
              onPointerDown={handleDocPointerDown}
              // Shift+clic: sin esto el navegador extiende tambien la seleccion de texto. El click
              // sigue llegando.
              onMouseDown={(event) => {
                if (event.shiftKey) event.preventDefault()
              }}
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
