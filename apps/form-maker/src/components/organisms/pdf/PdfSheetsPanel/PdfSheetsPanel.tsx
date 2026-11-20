import { Code, Grid, Plus } from 'reicon-react'
import {
  PANEL_BUTTON_CLASSES,
  PANEL_BUTTON_ON_CLASSES,
  PANEL_DANGER_LINK_CLASSES,
} from '../../../../constants'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import { PanelSection } from '../../../molecules'

// Cada hoja es un bloque con salto manual: lo que no cabe se mueve a mano.
export function PdfSheetsPanel() {
  const design = usePdfDesignStore((state) => state.design)
  const activeSheetId = usePdfDesignStore((state) => state.activeSheetId)
  const setActiveSheet = usePdfDesignStore((state) => state.setActiveSheet)
  const addSheet = usePdfDesignStore((state) => state.addSheet)
  const removeSheet = usePdfDesignStore((state) => state.removeSheet)
  const addBlock = usePdfDesignStore((state) => state.addBlock)
  if (!design) return null

  const activeIndex: number = design.sheets.findIndex((sheet) => sheet.id === activeSheetId)

  return (
    <PanelSection
      title="Hojas"
      description="Cada hoja es una página aparte. Si algo no cabe, la hoja lo avisa: pásalo a otra hoja o achica el margen."
    >
      <div className="flex flex-wrap gap-1.5">
        {design.sheets.map((sheet, index) => (
          <button
            key={sheet.id}
            type="button"
            onClick={() => setActiveSheet(sheet.id)}
            className={`${PANEL_BUTTON_CLASSES} min-w-7 ${sheet.id === activeSheetId ? PANEL_BUTTON_ON_CLASSES : ''}`}
            aria-pressed={sheet.id === activeSheetId}
          >
            {index + 1}
          </button>
        ))}
        <button type="button" onClick={addSheet} className={PANEL_BUTTON_CLASSES}>
          <Plus size={12} />
          Hoja
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button type="button" onClick={() => addBlock('table')} className={PANEL_BUTTON_CLASSES}>
          <Grid size={12} />
          Tabla
        </button>
        <button type="button" onClick={() => addBlock('html')} className={PANEL_BUTTON_CLASSES}>
          <Code size={12} />
          Bloque HTML
        </button>
      </div>
      <p className="text-[11px] text-fg-muted">
        Se agregan al final de la hoja {activeIndex >= 0 ? activeIndex + 1 : 1}.
      </p>

      {design.sheets.length > 1 && activeSheetId && (
        <button
          type="button"
          onClick={() => removeSheet(activeSheetId)}
          className={`${PANEL_DANGER_LINK_CLASSES} self-start`}
        >
          Quitar la hoja {activeIndex + 1} con todo lo que tiene
        </button>
      )}
    </PanelSection>
  )
}
