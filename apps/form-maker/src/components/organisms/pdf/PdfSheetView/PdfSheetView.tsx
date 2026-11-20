import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { PDF_CANVAS_CLASS } from '../../../../constants'
import { contentBox, documentStyleMap, mmToPx, sheetEdgeStyleMap } from '../../../../lib/pdfDesign'
import { usePdfOverflowToast } from '../../../../hooks/usePdfOverflowToast'
import { sanitizePdfHtml } from '../../../../lib/pdfHtml'
import type { PdfContentBox } from '../../../../types'
import { PdfTableView } from '../PdfTableView'
import type { PdfSheetViewProps, SheetOverflow } from './PdfSheetView.types'
import { measureSheetOverflow } from './PdfSheetView.utils'
import {
  BACK_MARGIN_PX,
  NO_OVERFLOW,
  PAPER_HEIGHT_PX,
  PAPER_SIZE,
  PAPER_WIDTH_PX,
} from './PdfSheetView.constants'

// Hoja de carta como la pondra el back; papel blanco tambien en oscuro. Guias: gris los 5 mm del
// back, naranja el margen extra. Lo que no cabe no pasa a la siguiente hoja: se recorta y se avisa.
export function PdfSheetView({
  sheet,
  design,
  index,
  total,
  isActive,
  zoom,
  selectedIds,
  selectedBlockId,
  onActivate,
  onSelectCell,
  onSelectBlock,
}: PdfSheetViewProps) {
  const flowRef = useRef<HTMLDivElement | null>(null)
  const [overflow, setOverflow] = useState<SheetOverflow>(NO_OVERFLOW)
  const box: PdfContentBox = contentBox(design.margins)
  const hasExtraMargin: boolean = Object.values(design.margins).some((mm) => mm > 0)

  // Se observa la hoja y cada bloque: una tabla puede ensancharse sin que la hoja cambie de alto.
  useEffect(() => {
    const flow: HTMLDivElement | null = flowRef.current
    if (!flow) return

    const observer = new ResizeObserver(() => {
      const next: SheetOverflow = measureSheetOverflow(flow, box.height)
      setOverflow((current) =>
        current.bottom === next.bottom && current.right === next.right ? current : next,
      )
    })
    observer.observe(flow)
    for (const child of Array.from(flow.children)) observer.observe(child)
    return () => observer.disconnect()
  }, [box.height, sheet.blocks])

  usePdfOverflowToast(sheet.id, index + 1, overflow.bottom, overflow.right)
  const overflows: boolean = overflow.bottom > 0 || overflow.right > 0

  const contentStyle: CSSProperties = {
    top: mmToPx(design.margins.top),
    right: mmToPx(design.margins.right),
    bottom: mmToPx(design.margins.bottom),
    left: mmToPx(design.margins.left),
    ...documentStyleMap(design),
  }
  const contentClass: string = [
    PDF_CANVAS_CLASS.content,
    hasExtraMargin ? PDF_CANVAS_CLASS.extra : '',
    overflows ? PDF_CANVAS_CLASS.overflow : '',
  ]
    .filter(Boolean)
    .join(' ')

  // El zoom escala con transform, que no cambia medidas: "No cabe" sigue midiendo px reales. A 100%
  // no se emite transform.
  const paperStyle: CSSProperties =
    zoom === 1 ? PAPER_SIZE : { ...PAPER_SIZE, transform: `scale(${zoom})`, transformOrigin: '0 0' }

  return (
    <section className={PDF_CANVAS_CLASS.sheet}>
      <div style={{ width: PAPER_WIDTH_PX * zoom, height: PAPER_HEIGHT_PX * zoom }}>
        <div
          className={`${PDF_CANVAS_CLASS.paper} ${isActive && total > 1 ? PDF_CANVAS_CLASS.active : ''}`}
          style={paperStyle}
          onClick={onActivate}
        >
          <div className={PDF_CANVAS_CLASS.back} style={{ inset: BACK_MARGIN_PX }}>
            <div className={contentClass} style={contentStyle}>
              <div ref={flowRef} className={PDF_CANVAS_CLASS.flow} style={sheetEdgeStyleMap()}>
                {sheet.blocks.map((block) =>
                  block.kind === 'table' ? (
                    <PdfTableView
                      key={block.id}
                      table={block}
                      fontFamily={design.fontFamily}
                      selectedIds={selectedIds}
                      onSelectCell={onSelectCell}
                    />
                  ) : (
                    <div
                      key={block.id}
                      className={`${PDF_CANVAS_CLASS.html} ${
                        selectedBlockId === block.id ? PDF_CANVAS_CLASS.selected : ''
                      }`}
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelectBlock(block.id)
                      }}
                      dangerouslySetInnerHTML={{ __html: sanitizePdfHtml(block.html) }}
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          {sheet.blocks.length === 0 && (
            <p className={PDF_CANVAS_CLASS.empty}>
              Hoja vacía: agrega una tabla o un bloque de HTML desde el panel
            </p>
          )}
        </div>
      </div>

      <p className={PDF_CANVAS_CLASS.caption}>
        Hoja {index + 1} de {total}
        {overflow.bottom > 0 && (
          <span className={PDF_CANVAS_CLASS.warning}>
            {' '}
            · No cabe: sobran {overflow.bottom} px. Pasa algo a otra hoja o achica el margen.
          </span>
        )}
        {overflow.right > 0 && (
          <span className={PDF_CANVAS_CLASS.warning}>
            {' '}
            · Se sale por la derecha: sobran {overflow.right} px y se pierde el borde. Achica el
            ancho de una columna.
          </span>
        )}
      </p>
    </section>
  )
}
