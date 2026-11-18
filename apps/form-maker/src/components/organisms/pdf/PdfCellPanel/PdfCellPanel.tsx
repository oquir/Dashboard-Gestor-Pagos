import {
  ADD_LINK_CLASSES,
  INPUT_CLASSES,
  PANEL_BUTTON_CLASSES,
  PANEL_BUTTON_ON_CLASSES,
  PDF_STYLE_KEYS,
  SWITCH_ITEM_ACTIVE_CLASSES,
  SWITCH_ITEM_BASE_CLASSES,
  SWITCH_ITEM_INACTIVE_CLASSES,
  SWITCH_TRACK_CLASSES,
  TEXTAREA_CLASSES,
} from '../../../../constants'
import { inheritedCellStyle, pdfClassTokens } from '../../../../lib/pdfDesign'
import { canNestTable, findCell, selectedCellIds } from '../../../../lib/pdfDesignEdit'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import type { PdfStyleProps } from '../../../../types'
import { Label, Tooltip } from '../../../atoms'
import { PanelSection } from '../../../molecules'
import { PdfComponentPanel } from '../PdfComponentPanel'
import { PdfStyleFields } from '../PdfStyleFields'
import { CONTENT_KINDS } from './PdfCellPanel.constants'

// La celda seleccionada, para quien apenas programa: casi todo son botones. El contenido es el de la
// celda del foco (la ultima que se toco); el estilo y las clases se aplican a todas las del
// rectangulo seleccionado, para poder poner una fila entera en negrilla de una vez. Lo mejor es
// darle a la celda una clase: el estilo propio de cada celda sale repetido en el .html. Estilos en
// linea quedan abajo, en "Avanzado", para quien los necesite.
export function PdfCellPanel() {
  const design = usePdfDesignStore((state) => state.design)
  const selection = usePdfDesignStore((state) => state.selection)
  const setCellText = usePdfDesignStore((state) => state.setCellText)
  const setCellHtml = usePdfDesignStore((state) => state.setCellHtml)
  const setCellContentKind = usePdfDesignStore((state) => state.setCellContentKind)
  const updateStyle = usePdfDesignStore((state) => state.updateSelectionStyle)
  const setSelectionClass = usePdfDesignStore((state) => state.setSelectionClass)
  const createClassFromSelection = usePdfDesignStore((state) => state.createClassFromSelection)

  if (!design || selection?.kind !== 'cells') return null
  const location = findCell(design, selection.focusCellId)
  if (!location) return null

  const cell = location.cell
  const count: number = selectedCellIds(design, selection).length
  const canNest: boolean = canNestTable(design, cell.id)
  const tokens: string[] = pdfClassTokens(cell.className)
  const inherited: PdfStyleProps = inheritedCellStyle(design, cell)
  const hasOwnStyle: boolean =
    PDF_STYLE_KEYS.some((key) => cell[key] !== undefined) || Boolean(cell.style?.trim())

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
            {count} celdas seleccionadas: el estilo y las clases se aplican a todas; el contenido es
            el de la última que tocaste.
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

        {cell.content.kind === 'component' && (
          <>
            <PdfComponentPanel cellId={cell.id} component={cell.content.component} />
            <p className="text-[11px] text-fg-subtle">
              Si al componente le falta algo, pasa la celda a HTML: queda su HTML para retocarlo a
              mano.
            </p>
          </>
        )}
      </PanelSection>

      <PanelSection
        title="Clases"
        description="Una clase es un estilo con nombre que llevan muchas celdas: en el HTML sale una sola vez, y cada celda dice solo su nombre. Si la celda tiene además estilo propio, ese gana sobre la clase."
      >
        {design.classes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {design.classes.map((item) => {
              const on: boolean = tokens.includes(item.name)
              return (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelectionClass(item.name, !on)}
                  className={`${PANEL_BUTTON_CLASSES} font-mono ${on ? PANEL_BUTTON_ON_CLASSES : ''}`}
                >
                  {item.name}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-[11px] text-fg-subtle">
            El diseño todavía no tiene clases. Dale a esta celda el estilo que quieras y créala con
            el botón de abajo.
          </p>
        )}
        <Tooltip
          content={
            hasOwnStyle
              ? 'La clase toma el estilo propio de esta celda y se pone en las seleccionadas'
              : 'Esta celda no tiene estilo propio: la clase sale vacía y se llena en el editor de clases'
          }
        >
          <button
            type="button"
            onClick={() => createClassFromSelection()}
            className={`${ADD_LINK_CLASSES} self-start`}
          >
            + Nueva clase con este estilo
          </button>
        </Tooltip>
      </PanelSection>

      <PdfStyleFields
        idPrefix="pdf-cell"
        value={cell}
        inherited={inherited}
        defaultFontSize={design.fontSize}
        onChange={updateStyle}
      />

      <PanelSection
        title="Avanzado"
        description="Para quien sabe CSS. Aquí van todas las clases de la celda, también las que define a mano un bloque HTML con <style>. Los estilos en línea se limpian igual que el HTML libre, y ganan sobre lo de arriba."
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
            placeholder="celda negrita"
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
