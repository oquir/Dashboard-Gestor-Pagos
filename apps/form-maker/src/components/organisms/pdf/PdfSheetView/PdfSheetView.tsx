import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { PDF_CANVAS_CLASS } from '../../../../constants'
import { contentBox, fontStack, mmToPx } from '../../../../lib/pdfDesign'
import { sanitizePdfHtml } from '../../../../lib/pdfHtml'
import type { PdfContentBox } from '../../../../types'
import { PdfTableView } from '../PdfTableView'
import type { PdfSheetViewProps } from './PdfSheetView.types'
import { BACK_MARGIN_PX, PAPER_SIZE } from './PdfSheetView.constants'

// Una hoja de carta tal como la pondra el back, dentro del shadow root del lienzo (sus clases las
// define PdfCanvas). El papel es blanco y la letra negra tambien en modo oscuro: es papel. Dos
// guias: la gris son los 5 mm fijos del back; la naranja, el margen extra del diseño.
//
// Lo que no cabe NO pasa a la hoja siguiente: se recorta en la guia y la hoja avisa cuanto sobra,
// para que el autor lo mueva a otra hoja. Se mide el contenido con un ResizeObserver.
export function PdfSheetView({
  sheet,
  design,
  index,
  total,
  isActive,
  selectedIds,
  selectedBlockId,
  onActivate,
  onSelectCell,
  onSelectBlock,
}: PdfSheetViewProps) {
  const flowRef = useRef<HTMLDivElement | null>(null)
  const [overflow, setOverflow] = useState<number>(0)
  const box: PdfContentBox = contentBox(design.margins)
  const hasExtraMargin: boolean = Object.values(design.margins).some((mm) => mm > 0)

  useEffect(() => {
    const flow: HTMLDivElement | null = flowRef.current
    if (!flow) return

    // Medio pixel de tolerancia: el redondeo de los px de mm no es un desborde.
    const observer = new ResizeObserver(() =>
      setOverflow(Math.max(0, Math.ceil(flow.offsetHeight - box.height - 0.5))),
    )
    observer.observe(flow)
    return () => observer.disconnect()
  }, [box.height])

  const contentStyle: CSSProperties = {
    top: mmToPx(design.margins.top),
    right: mmToPx(design.margins.right),
    bottom: mmToPx(design.margins.bottom),
    left: mmToPx(design.margins.left),
    fontFamily: fontStack(design.fontFamily),
    fontSize: design.fontSize,
  }
  const contentClass: string = [
    PDF_CANVAS_CLASS.content,
    hasExtraMargin ? PDF_CANVAS_CLASS.extra : '',
    overflow > 0 ? PDF_CANVAS_CLASS.overflow : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={PDF_CANVAS_CLASS.sheet}>
      <div
        className={`${PDF_CANVAS_CLASS.paper} ${isActive ? PDF_CANVAS_CLASS.active : ''}`}
        style={PAPER_SIZE}
        onClick={onActivate}
      >
        <div className={PDF_CANVAS_CLASS.back} style={{ inset: BACK_MARGIN_PX }}>
          <div className={contentClass} style={contentStyle}>
            <div ref={flowRef} className={PDF_CANVAS_CLASS.flow}>
              {sheet.blocks.map((block) =>
                block.kind === 'table' ? (
                  <PdfTableView
                    key={block.id}
                    table={block}
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

      <p className={PDF_CANVAS_CLASS.caption}>
        Hoja {index + 1} de {total}
        {overflow > 0 && (
          <span className={PDF_CANVAS_CLASS.warning}>
            {' '}
            · No cabe: sobran {overflow} px. Pasa algo a otra hoja o achica el margen.
          </span>
        )}
      </p>
    </section>
  )
}
