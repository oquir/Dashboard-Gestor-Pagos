import {
  INPUT_CLASSES,
  PANEL_BUTTON_CLASSES,
  PANEL_DANGER_LINK_CLASSES,
  TEXTAREA_CLASSES,
} from '../../../../constants'
import { canMoveBlock, findCell } from '../../../../lib/pdfDesignEdit'
import { canMerge, canSplit, findPlaced, placeCells } from '../../../../lib/pdfTable'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import { Label } from '../../../atoms'
import { PanelSection } from '../../../molecules'
import { PdfNumberField } from '../PdfNumberField'

// Lo que no se puede hacer se deshabilita y no se oculta: la barra no cambia de forma.
export function PdfTablePanel() {
  const design = usePdfDesignStore((state) => state.design)
  const selection = usePdfDesignStore((state) => state.selection)
  const insertRow = usePdfDesignStore((state) => state.insertRow)
  const removeRow = usePdfDesignStore((state) => state.removeRow)
  const insertColumn = usePdfDesignStore((state) => state.insertColumn)
  const removeColumn = usePdfDesignStore((state) => state.removeColumn)
  const mergeSelection = usePdfDesignStore((state) => state.mergeSelection)
  const splitCell = usePdfDesignStore((state) => state.splitCell)
  const setColumnWidth = usePdfDesignStore((state) => state.setColumnWidth)
  const setRowHeight = usePdfDesignStore((state) => state.setRowHeight)
  const updateTableStyle = usePdfDesignStore((state) => state.updateTableStyle)
  const moveBlock = usePdfDesignStore((state) => state.moveBlock)
  const removeTable = usePdfDesignStore((state) => state.removeTable)

  if (!design || selection?.kind !== 'cells') return null
  const location = findCell(design, selection.focusCellId)
  if (!location) return null

  const { table, cell } = location
  const { rowCount, colCount } = placeCells(table)
  const column: number = findPlaced(table, cell.id)?.col ?? 0
  const row = table.rows.find((item) => item.cells.some((candidate) => candidate.id === cell.id))
  const isLoose: boolean = location.depth === 1

  return (
    <PanelSection
      title="Tabla"
      aside={
        <span className="text-[10px] text-fg-muted tabular-nums">
          {colCount} × {rowCount}
        </span>
      }
      description="Las filas y columnas se agregan junto a la celda seleccionada. Para combinar, selecciona una celda y haz Shift+clic en otra."
    >
      <div className="grid grid-cols-3 gap-1.5">
        <button type="button" onClick={() => insertRow('above')} className={PANEL_BUTTON_CLASSES}>
          + Fila arriba
        </button>
        <button type="button" onClick={() => insertRow('below')} className={PANEL_BUTTON_CLASSES}>
          + Fila abajo
        </button>
        <button
          type="button"
          onClick={removeRow}
          disabled={rowCount <= 1}
          className={PANEL_BUTTON_CLASSES}
        >
          Quitar fila
        </button>
        <button type="button" onClick={() => insertColumn('left')} className={PANEL_BUTTON_CLASSES}>
          + Col. izq.
        </button>
        <button
          type="button"
          onClick={() => insertColumn('right')}
          className={PANEL_BUTTON_CLASSES}
        >
          + Col. der.
        </button>
        <button
          type="button"
          onClick={removeColumn}
          disabled={colCount <= 1}
          className={PANEL_BUTTON_CLASSES}
        >
          Quitar col.
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={mergeSelection}
          disabled={!canMerge(table, selection.anchorCellId, selection.focusCellId)}
          className={PANEL_BUTTON_CLASSES}
        >
          Combinar
        </button>
        <button
          type="button"
          onClick={splitCell}
          disabled={!canSplit(table, cell.id)}
          className={PANEL_BUTTON_CLASSES}
        >
          Dividir
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PdfNumberField
          id="pdf-column-width"
          label={`Ancho col. ${column + 1}`}
          value={table.columns[column]?.width}
          placeholder="Auto"
          min={1}
          suffix="px"
          onChange={setColumnWidth}
        />
        <PdfNumberField
          id="pdf-row-height"
          label="Alto de la fila"
          value={row?.height}
          placeholder="Auto"
          min={1}
          suffix="px"
          onChange={setRowHeight}
        />
      </div>

      <details className="group">
        <summary className="cursor-pointer text-[11px] font-medium text-fg-muted hover:text-fg-strong">
          Clases y estilos de la tabla
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          <div>
            <Label htmlFor="pdf-table-class" className="text-[11px]">
              Clases
            </Label>
            <input
              id="pdf-table-class"
              value={table.className ?? ''}
              onChange={(event) =>
                updateTableStyle(table.id, { className: event.target.value || undefined })
              }
              spellCheck={false}
              placeholder="table-full"
              className={`${INPUT_CLASSES} font-mono`}
            />
          </div>
          <div>
            <Label htmlFor="pdf-table-style" className="text-[11px]">
              Estilos en línea
            </Label>
            <textarea
              id="pdf-table-style"
              value={table.style ?? ''}
              onChange={(event) =>
                updateTableStyle(table.id, { style: event.target.value || undefined })
              }
              spellCheck={false}
              placeholder="margin-top: 4px;"
              className={`${TEXTAREA_CLASSES} h-16`}
            />
          </div>
        </div>
      </details>

      <div className="flex items-center gap-1.5">
        {isLoose && (
          <>
            <button
              type="button"
              onClick={() => moveBlock(table.id, -1)}
              disabled={!canMoveBlock(design, table.id, -1)}
              className={PANEL_BUTTON_CLASSES}
            >
              Subir
            </button>
            <button
              type="button"
              onClick={() => moveBlock(table.id, 1)}
              disabled={!canMoveBlock(design, table.id, 1)}
              className={PANEL_BUTTON_CLASSES}
            >
              Bajar
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => removeTable(table.id)}
          className={`${PANEL_DANGER_LINK_CLASSES} ml-auto`}
        >
          {isLoose ? 'Quitar tabla' : 'Quitar tabla anidada'}
        </button>
      </div>
    </PanelSection>
  )
}
