import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { PDF_CANVAS_CLASS } from '../../../../constants'
import { selectedCellIds } from '../../../../lib/pdfDesignEdit'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import { PdfSheetView } from '../PdfSheetView'
import { CANVAS_CSS } from './PdfCanvas.constants'

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

  // attachShadow solo se puede llamar una vez por elemento: si ya tiene, se reusa.
  const hostRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setShadowRoot(node.shadowRoot ?? node.attachShadow({ mode: 'open' }))
  }, [])

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
            <div className={PDF_CANVAS_CLASS.doc}>
              {design.sheets.map((sheet, index) => (
                <PdfSheetView
                  key={sheet.id}
                  sheet={sheet}
                  design={design}
                  index={index}
                  total={design.sheets.length}
                  isActive={sheet.id === activeSheetId}
                  selectedIds={selectedIds}
                  selectedBlockId={selectedBlockId}
                  onActivate={() => {
                    setActiveSheet(sheet.id)
                    clearSelection()
                  }}
                  onSelectCell={selectCell}
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
