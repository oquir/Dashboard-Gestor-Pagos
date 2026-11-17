import {
  INPUT_CLASSES,
  PANEL_BUTTON_CLASSES,
  PANEL_BUTTON_ON_CLASSES,
  SWITCH_ITEM_ACTIVE_CLASSES,
  SWITCH_ITEM_BASE_CLASSES,
  SWITCH_ITEM_INACTIVE_CLASSES,
  SWITCH_TRACK_CLASSES,
  TEXTAREA_CLASSES,
} from '../../../../constants'
import { canNestTable, findCell, selectedCellIds } from '../../../../lib/pdfDesignEdit'
import { ALL_BORDERS } from '../../../../lib/pdfTable'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import type { PdfCellBorders } from '../../../../types'
import { Label, Tooltip } from '../../../atoms'
import { ColorPickerField, PanelSection } from '../../../molecules'
import { PdfNumberField } from '../PdfNumberField'
import {
  BORDER_SIDES,
  CONTENT_KINDS,
  HORIZONTAL_ALIGNS,
  NO_BORDERS,
  VERTICAL_ALIGNS,
} from './PdfCellPanel.constants'

// La celda seleccionada, para quien apenas programa: casi todo son botones. El contenido es el de la
// celda del foco (la ultima que se toco); el estilo se aplica a todas las del rectangulo
// seleccionado, para poder poner una fila entera en negrilla de una vez. Clases y estilos en linea
// quedan abajo, en "Avanzado", para quien los necesite.
export function PdfCellPanel() {
  const design = usePdfDesignStore((state) => state.design)
  const selection = usePdfDesignStore((state) => state.selection)
  const setCellText = usePdfDesignStore((state) => state.setCellText)
  const setCellHtml = usePdfDesignStore((state) => state.setCellHtml)
  const setCellContentKind = usePdfDesignStore((state) => state.setCellContentKind)
  const updateStyle = usePdfDesignStore((state) => state.updateSelectionStyle)

  if (!design || selection?.kind !== 'cells') return null
  const location = findCell(design, selection.focusCellId)
  if (!location) return null

  const cell = location.cell
  const count: number = selectedCellIds(design, selection).length
  const canNest: boolean = canNestTable(design, cell.id)
  const borders: PdfCellBorders = cell.borders ?? NO_BORDERS

  return (
    <>
      <PanelSection
        title="Contenido de la celda"
        aside={
          location.depth > 1 ? (
            <span className="text-[10px] text-fg-subtle">
              Tabla anidada · nivel {location.depth}
            </span>
          ) : undefined
        }
      >
        {count > 1 && (
          <p className="text-[11px] text-fg-subtle">
            {count} celdas seleccionadas: el estilo se aplica a todas; el contenido es el de la
            última que tocaste.
          </p>
        )}

        <div className={SWITCH_TRACK_CLASSES} role="radiogroup" aria-label="Qué lleva la celda">
          {CONTENT_KINDS.map(({ kind, label }) => {
            const disabled: boolean = kind === 'table' && !canNest && cell.content.kind !== 'table'
            const button = (
              <button
                key={kind}
                type="button"
                role="radio"
                aria-checked={cell.content.kind === kind}
                disabled={disabled}
                onClick={() => setCellContentKind(cell.id, kind)}
                className={`${SWITCH_ITEM_BASE_CLASSES} disabled:cursor-not-allowed disabled:opacity-40 ${
                  cell.content.kind === kind
                    ? SWITCH_ITEM_ACTIVE_CLASSES
                    : SWITCH_ITEM_INACTIVE_CLASSES
                }`}
              >
                {label}
              </button>
            )
            return disabled ? (
              <Tooltip key={kind} content="Hasta 4 tablas una dentro de otra">
                <span className="flex flex-1">{button}</span>
              </Tooltip>
            ) : (
              button
            )
          })}
        </div>

        {cell.content.kind === 'text' && (
          <>
            <textarea
              aria-label="Texto de la celda"
              value={cell.content.text}
              onChange={(event) => setCellText(cell.id, event.target.value)}
              className={`${INPUT_CLASSES} h-20 resize-y`}
              placeholder="Texto fijo, {variable} o los dos"
            />
            <p className="text-[11px] text-fg-subtle">
              Escribe entre llaves el dato que pone el back, como {'{total_impuesto_a_cargo}'}. Se
              puede mezclar con texto fijo.
            </p>
          </>
        )}

        {cell.content.kind === 'html' && (
          <>
            <textarea
              aria-label="HTML de la celda"
              value={cell.content.html}
              onChange={(event) => setCellHtml(cell.id, event.target.value)}
              className={TEXTAREA_CLASSES}
              spellCheck={false}
              placeholder="<b>…</b>"
            />
            <p className="text-[11px] text-fg-subtle">
              Se limpia al pintar y al publicar: sin scripts, iframes, formularios ni eventos. Se
              permite {'<style>'}.
            </p>
          </>
        )}

        {cell.content.kind === 'table' && (
          <p className="text-[11px] text-fg-subtle">
            Esta celda lleva una tabla adentro: haz clic en sus celdas para editarlas.
          </p>
        )}
      </PanelSection>

      <PanelSection title="Letra">
        <div className="grid grid-cols-[88px_1fr] items-end gap-2">
          <PdfNumberField
            id="pdf-cell-font-size"
            label="Tamaño"
            value={cell.fontSize}
            placeholder={String(design.fontSize)}
            min={1}
            suffix="px"
            onChange={(value) => updateStyle({ fontSize: value })}
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              aria-label="Negrilla"
              aria-pressed={cell.bold === true}
              onClick={() => updateStyle({ bold: cell.bold ? undefined : true })}
              className={`${PANEL_BUTTON_CLASSES} w-8 font-bold ${cell.bold ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              N
            </button>
            <button
              type="button"
              aria-label="Cursiva"
              aria-pressed={cell.italic === true}
              onClick={() => updateStyle({ italic: cell.italic ? undefined : true })}
              className={`${PANEL_BUTTON_CLASSES} w-8 italic ${cell.italic ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              K
            </button>
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Alineación">
        <div className="grid grid-cols-3 gap-1.5">
          {HORIZONTAL_ALIGNS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={(cell.align ?? 'left') === value}
              onClick={() => updateStyle({ align: value === 'left' ? undefined : value })}
              className={`${PANEL_BUTTON_CLASSES} ${(cell.align ?? 'left') === value ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              {label}
            </button>
          ))}
          {VERTICAL_ALIGNS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={(cell.verticalAlign ?? 'top') === value}
              onClick={() => updateStyle({ verticalAlign: value === 'top' ? undefined : value })}
              className={`${PANEL_BUTTON_CLASSES} ${(cell.verticalAlign ?? 'top') === value ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Bordes">
        <div className="grid grid-cols-4 gap-1.5">
          {BORDER_SIDES.map(({ side, label }) => (
            <button
              key={side}
              type="button"
              aria-pressed={borders[side]}
              onClick={() => updateStyle({ borders: { ...borders, [side]: !borders[side] } })}
              className={`${PANEL_BUTTON_CLASSES} ${borders[side] ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => updateStyle({ borders: ALL_BORDERS })}
            className={PANEL_BUTTON_CLASSES}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => updateStyle({ borders: undefined })}
            className={PANEL_BUTTON_CLASSES}
          >
            Ninguno
          </button>
        </div>
      </PanelSection>

      <PanelSection
        title="Fondo"
        aside={
          cell.backgroundColor ? (
            <button
              type="button"
              onClick={() => updateStyle({ backgroundColor: undefined })}
              className="text-[11px] font-medium text-fg-subtle hover:cursor-pointer hover:text-fg-strong"
            >
              Quitar
            </button>
          ) : undefined
        }
      >
        <ColorPickerField
          id="pdf-cell-background"
          label="Color"
          value={cell.backgroundColor ?? ''}
          defaultColor="#ffffff"
          placeholder="Sin fondo"
          onChange={(value) => updateStyle({ backgroundColor: value || undefined })}
        />
      </PanelSection>

      <PanelSection
        title="Avanzado"
        description="Para quien sabe CSS. Las clases se definen en un bloque HTML con <style>. Los estilos en línea se limpian igual que el HTML libre, y ganan sobre lo de arriba."
      >
        <div>
          <Label htmlFor="pdf-cell-class" className="text-[11px]">
            Clases
          </Label>
          <input
            id="pdf-cell-class"
            value={cell.className ?? ''}
            onChange={(event) => updateStyle({ className: event.target.value || undefined })}
            spellCheck={false}
            placeholder="cell-bordered grayRow"
            className={`${INPUT_CLASSES} font-mono`}
          />
        </div>
        <div>
          <Label htmlFor="pdf-cell-style" className="text-[11px]">
            Estilos en línea
          </Label>
          <textarea
            id="pdf-cell-style"
            value={cell.style ?? ''}
            onChange={(event) => updateStyle({ style: event.target.value || undefined })}
            spellCheck={false}
            placeholder="letter-spacing: 1px;"
            className={`${TEXTAREA_CLASSES} h-16`}
          />
        </div>
      </PanelSection>
    </>
  )
}
