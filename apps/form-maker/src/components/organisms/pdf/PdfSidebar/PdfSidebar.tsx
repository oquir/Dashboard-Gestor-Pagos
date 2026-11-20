import {
  SWITCH_ITEM_ACTIVE_CLASSES,
  SWITCH_ITEM_BASE_CLASSES,
  SWITCH_ITEM_INACTIVE_CLASSES,
  SWITCH_TRACK_CLASSES,
} from '../../../../constants'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import { PdfCellPanel } from '../PdfCellPanel'
import { PdfClassesPanel } from '../PdfClassesPanel'
import { PdfDocumentPanel } from '../PdfDocumentPanel'
import { PdfHtmlBlockPanel } from '../PdfHtmlBlockPanel'
import { PdfSheetsPanel } from '../PdfSheetsPanel'
import { PdfTablePanel } from '../PdfTablePanel'
import { SIDEBAR_TABS } from './PdfSidebar.constants'

// La barra lateral amena del PDF (docs/Pendientes-PDF.md §2.1, docs/Plan-PDF-UX-P2.md): arriba,
// fijo, lo de la hoja; debajo dos pestañas, lo seleccionado y lo de todo el documento. Con una celda
// seleccionada su tabla va primero: agregar filas y combinar es lo que mas se usa al armar.
export function PdfSidebar() {
  const selectionKind = usePdfDesignStore((state) => state.selection?.kind ?? null)
  const sidebarTab = usePdfDesignStore((state) => state.sidebarTab)
  const setSidebarTab = usePdfDesignStore((state) => state.setSidebarTab)

  return (
    <div className="flex flex-col gap-3 p-3">
      <PdfSheetsPanel />

      <div className={SWITCH_TRACK_CLASSES} role="tablist" aria-label="Qué editar">
        {SIDEBAR_TABS.map(({ tab, label }) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={sidebarTab === tab}
            onClick={() => setSidebarTab(tab)}
            className={`${SWITCH_ITEM_BASE_CLASSES} ${
              sidebarTab === tab ? SWITCH_ITEM_ACTIVE_CLASSES : SWITCH_ITEM_INACTIVE_CLASSES
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sidebarTab === 'selection' && (
        <>
          {selectionKind === 'cells' && (
            <>
              <PdfTablePanel />
              <PdfCellPanel />
            </>
          )}
          {selectionKind === 'block' && <PdfHtmlBlockPanel />}
          {selectionKind === null && (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[11px] text-fg-muted">
              Haz clic en una celda o en un bloque de la hoja para editarlo. Shift+clic en otra
              celda selecciona el rectángulo entre las dos.
            </p>
          )}
        </>
      )}

      {sidebarTab === 'document' && (
        <>
          <PdfClassesPanel />
          <PdfDocumentPanel />
        </>
      )}
    </div>
  )
}
