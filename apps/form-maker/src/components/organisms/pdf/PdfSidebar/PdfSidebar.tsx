import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import { PdfCellPanel } from '../PdfCellPanel'
import { PdfDocumentPanel } from '../PdfDocumentPanel'
import { PdfHtmlBlockPanel } from '../PdfHtmlBlockPanel'
import { PdfSheetsPanel } from '../PdfSheetsPanel'
import { PdfTablePanel } from '../PdfTablePanel'

// La barra lateral amena del PDF (docs/Pendientes-PDF.md §2.1): arriba lo de la hoja, abajo lo de
// lo seleccionado. Con una celda seleccionada, su tabla va primero: agregar filas y combinar es lo
// que mas se usa mientras se arma una declaracion.
export function PdfSidebar() {
  const selectionKind = usePdfDesignStore((state) => state.selection?.kind ?? null)

  return (
    <div className="flex flex-col gap-3 p-3">
      <PdfSheetsPanel />

      {selectionKind === 'cells' && (
        <>
          <PdfTablePanel />
          <PdfCellPanel />
        </>
      )}
      {selectionKind === 'block' && <PdfHtmlBlockPanel />}
      {selectionKind === null && (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[11px] text-fg-subtle">
          Haz clic en una celda o en un bloque de la hoja para editarlo. Shift+clic en otra celda
          selecciona el rectángulo entre las dos.
        </p>
      )}

      <PdfDocumentPanel />
    </div>
  )
}
