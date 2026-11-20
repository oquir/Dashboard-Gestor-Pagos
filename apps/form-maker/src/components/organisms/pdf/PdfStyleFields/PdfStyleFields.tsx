import { PANEL_BUTTON_CLASSES, PANEL_BUTTON_ON_CLASSES } from '../../../../constants'
import { ALL_BORDERS } from '../../../../lib/pdfTable'
import type { PdfCellBorders } from '../../../../types'
import { ColorPickerField, PanelSection } from '../../../molecules'
import { PdfNumberField } from '../PdfNumberField'
import type { PdfStyleFieldsProps } from './PdfStyleFields.types'
import {
  BORDER_SIDES,
  HORIZONTAL_ALIGNS,
  NO_BORDERS,
  VERTICAL_ALIGNS,
} from './PdfStyleFields.constants'

// Letra, alineacion, bordes y fondo: lo mismo para una celda que para una clase. Cada boton muestra
// lo que de verdad tiene (lo propio o, si no, lo de sus clases), y elegir lo que ya da la clase
// borra lo propio en vez de repetirlo: asi el .html no vuelve a llenarse de estilos sueltos.
export function PdfStyleFields({
  idPrefix,
  value,
  inherited,
  defaultFontSize,
  onChange,
}: PdfStyleFieldsProps) {
  const bold: boolean = value.bold ?? inherited.bold ?? false
  const italic: boolean = value.italic ?? inherited.italic ?? false
  const align = value.align ?? inherited.align ?? 'left'
  const verticalAlign = value.verticalAlign ?? inherited.verticalAlign ?? 'top'
  const inheritedBorders: PdfCellBorders = inherited.borders ?? NO_BORDERS
  const borders: PdfCellBorders = value.borders ?? inheritedBorders

  // Un valor igual al heredado no se guarda: undefined vuelve a heredar.
  function own<T>(next: T, base: T): T | undefined {
    return JSON.stringify(next) === JSON.stringify(base) ? undefined : next
  }

  return (
    <>
      <PanelSection legibleTitle title="Letra">
        <div className="grid grid-cols-[88px_1fr] items-end gap-2">
          <PdfNumberField
            id={`${idPrefix}-font-size`}
            label="Tamaño"
            value={value.fontSize}
            placeholder={String(inherited.fontSize ?? defaultFontSize)}
            min={1}
            suffix="px"
            onChange={(fontSize) => onChange({ fontSize })}
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              aria-label="Negrilla"
              aria-pressed={bold}
              onClick={() => onChange({ bold: own(!bold, inherited.bold ?? false) })}
              className={`${PANEL_BUTTON_CLASSES} w-8 font-bold ${bold ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              N
            </button>
            <button
              type="button"
              aria-label="Cursiva"
              aria-pressed={italic}
              onClick={() => onChange({ italic: own(!italic, inherited.italic ?? false) })}
              className={`${PANEL_BUTTON_CLASSES} w-8 italic ${italic ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              K
            </button>
          </div>
        </div>
      </PanelSection>

      <PanelSection legibleTitle title="Alineación">
        <div className="grid grid-cols-3 gap-1.5">
          {HORIZONTAL_ALIGNS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={align === option.value}
              onClick={() => onChange({ align: own(option.value, inherited.align ?? 'left') })}
              className={`${PANEL_BUTTON_CLASSES} ${align === option.value ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              {option.label}
            </button>
          ))}
          {VERTICAL_ALIGNS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={verticalAlign === option.value}
              onClick={() =>
                onChange({ verticalAlign: own(option.value, inherited.verticalAlign ?? 'top') })
              }
              className={`${PANEL_BUTTON_CLASSES} ${verticalAlign === option.value ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection legibleTitle title="Bordes">
        <div className="grid grid-cols-4 gap-1.5">
          {BORDER_SIDES.map(({ side, label }) => (
            <button
              key={side}
              type="button"
              aria-pressed={borders[side]}
              onClick={() =>
                onChange({ borders: own({ ...borders, [side]: !borders[side] }, inheritedBorders) })
              }
              className={`${PANEL_BUTTON_CLASSES} ${borders[side] ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ borders: own(ALL_BORDERS, inheritedBorders) })}
            className={PANEL_BUTTON_CLASSES}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onChange({ borders: own(NO_BORDERS, inheritedBorders) })}
            className={PANEL_BUTTON_CLASSES}
          >
            Ninguno
          </button>
        </div>
      </PanelSection>

      <PanelSection
        legibleTitle
        title="Fondo"
        aside={
          value.backgroundColor ? (
            <button
              type="button"
              onClick={() => onChange({ backgroundColor: undefined })}
              className="text-[11px] font-medium text-fg-muted hover:cursor-pointer hover:text-fg-strong"
            >
              Quitar
            </button>
          ) : undefined
        }
      >
        <ColorPickerField
          id={`${idPrefix}-background`}
          label="Color"
          value={value.backgroundColor ?? ''}
          defaultColor={inherited.backgroundColor ?? '#ffffff'}
          placeholder={inherited.backgroundColor ?? 'Sin fondo'}
          onChange={(backgroundColor) =>
            onChange({ backgroundColor: backgroundColor || undefined })
          }
        />
      </PanelSection>
    </>
  )
}
