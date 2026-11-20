import {
  PANEL_BUTTON_CLASSES,
  PANEL_BUTTON_ON_CLASSES,
  PDF_COMPONENT_OPTIONS,
  PDF_FONT_OPTIONS,
  SELECT_CLASSES,
  WARNING_BANNER_CLASSES,
} from '../../../../constants'
import { cleanPdfVariable, createPdfComponent } from '../../../../lib/pdfComponents'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import type { PdfComponent, PdfFontFamily } from '../../../../types'
import { Label, Tooltip } from '../../../atoms'
import { PdfImageSourceField } from '../PdfImageSourceField'
import { PdfNumberField } from '../PdfNumberField'
import { PdfSignaturesFields } from '../PdfSignaturesFields'
import { PdfTextField } from '../PdfTextField'
import type { PdfComponentPanelProps } from './PdfComponentPanel.types'
import { DIRECTIONS, DOCUMENT_FONT, HAS_VARIABLE } from './PdfComponentPanel.constants'

export function PdfComponentPanel({ cellId, component }: PdfComponentPanelProps) {
  const setCellComponent = usePdfDesignStore((state) => state.setCellComponent)
  const update = (next: PdfComponent): void => setCellComponent(cellId, next)

  return (
    <>
      <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Qué componente">
        {PDF_COMPONENT_OPTIONS.map((option) => (
          <Tooltip key={option.type} content={option.description}>
            <button
              type="button"
              role="radio"
              aria-checked={component.type === option.type}
              onClick={() =>
                component.type !== option.type && update(createPdfComponent(option.type))
              }
              className={`${PANEL_BUTTON_CLASSES} w-full ${component.type === option.type ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              {option.label}
            </button>
          </Tooltip>
        ))}
      </div>

      {component.type === 'image' && (
        <>
          <PdfImageSourceField
            id="pdf-image-src"
            label="Imagen"
            src={component.src}
            display={{ width: component.width, height: component.height }}
            onChange={(src) => update({ ...component, src })}
          />
          <div className="grid grid-cols-2 gap-2">
            <PdfNumberField
              id="pdf-image-width"
              label="Ancho"
              value={component.width}
              placeholder="Auto"
              min={1}
              suffix="px"
              onChange={(width) => update(withOptional(component, 'width', width))}
            />
            <PdfNumberField
              id="pdf-image-height"
              label="Alto"
              value={component.height}
              placeholder="Auto"
              min={1}
              suffix="px"
              onChange={(height) => update(withOptional(component, 'height', height))}
            />
          </div>
          <p className="text-[11px] text-fg-muted">
            Con una sola medida, la otra sale de la proporción de la imagen.
          </p>
          <PdfTextField
            id="pdf-image-alt"
            label="Texto alternativo"
            value={component.alt ?? ''}
            placeholder="Escudo de…"
            onChange={(alt) => update(withOptional(component, 'alt', alt || undefined))}
          />
        </>
      )}

      {component.type === 'verticalText' && (
        <>
          <PdfTextField
            id="pdf-vertical-text"
            label="Texto (un renglón por línea)"
            value={component.text}
            multiline
            onChange={(text) => update({ ...component, text })}
          />
          {HAS_VARIABLE.test(component.text) && (
            <p className={WARNING_BANNER_CLASSES}>
              Sale como imagen: la {'{variable}'} se imprime tal cual, el back no la reemplaza.
            </p>
          )}
          <div className="grid grid-cols-2 gap-1.5">
            {DIRECTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={component.direction === value}
                onClick={() => update({ ...component, direction: value })}
                className={`${PANEL_BUTTON_CLASSES} ${component.direction === value ? PANEL_BUTTON_ON_CLASSES : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_72px_32px] items-end gap-2">
            <div className="min-w-0">
              <Label htmlFor="pdf-vertical-font" className="text-[11px]">
                Fuente
              </Label>
              <select
                id="pdf-vertical-font"
                value={component.fontFamily ?? DOCUMENT_FONT}
                onChange={(event) =>
                  update(
                    withOptional(
                      component,
                      'fontFamily',
                      (event.target.value || undefined) as PdfFontFamily | undefined,
                    ),
                  )
                }
                className={`${SELECT_CLASSES} w-full`}
              >
                <option value={DOCUMENT_FONT}>La del documento</option>
                {PDF_FONT_OPTIONS.map((option) => (
                  <option key={option.family} value={option.family}>
                    {option.family}
                  </option>
                ))}
              </select>
            </div>
            <PdfNumberField
              id="pdf-vertical-size"
              label="Tamaño"
              value={component.fontSize}
              min={1}
              suffix="px"
              onChange={(fontSize) => fontSize && update({ ...component, fontSize })}
            />
            <button
              type="button"
              aria-label="Negrilla"
              aria-pressed={component.bold}
              onClick={() => update({ ...component, bold: !component.bold })}
              className={`${PANEL_BUTTON_CLASSES} font-bold ${component.bold ? PANEL_BUTTON_ON_CLASSES : ''}`}
            >
              N
            </button>
          </div>
          <p className="text-[11px] text-fg-muted">
            Sale como imagen PNG, porque el convertidor del back no pinta bien el texto girado. El
            mismo PNG se ve en la hoja.
          </p>
        </>
      )}

      {component.type === 'nit' && (
        <>
          <PdfTextField
            id="pdf-nit-label"
            label="Rótulo"
            value={component.label}
            placeholder="Sin rótulo"
            onChange={(label) => update({ ...component, label })}
          />
          <div className="grid grid-cols-[1fr_96px] gap-2">
            <PdfTextField
              id="pdf-nit-number"
              label="Número"
              value={component.number}
              onChange={(number) => update({ ...component, number })}
            />
            <PdfTextField
              id="pdf-nit-dv"
              label="DV"
              value={component.dv}
              onChange={(dv) => update({ ...component, dv })}
            />
          </div>
        </>
      )}

      {component.type === 'signatures' && (
        <PdfSignaturesFields component={component} onChange={update} />
      )}

      {component.type === 'barcode' && (
        <>
          <PdfTextField
            id="pdf-barcode-variable"
            label="Variable con la imagen"
            value={component.variable}
            prefix="{"
            suffix="}"
            onChange={(value) => update({ ...component, variable: cleanPdfVariable(value) })}
          />
          <div className="grid grid-cols-2 gap-2">
            <PdfNumberField
              id="pdf-barcode-width"
              label="Ancho"
              value={component.width}
              min={1}
              suffix="px"
              onChange={(width) => width && update({ ...component, width })}
            />
            <PdfNumberField
              id="pdf-barcode-height"
              label="Alto"
              value={component.height}
              min={1}
              suffix="px"
              onChange={(height) => height && update({ ...component, height })}
            />
          </div>
          <p className="text-[11px] text-fg-muted">
            El back arma el código (GS1-128) y pone su imagen en esa variable. Se puede achatar a lo
            alto; a lo ancho, mejor no: se lee a lo ancho.
          </p>
        </>
      )}

      {component.type === 'qr' && (
        <>
          <PdfTextField
            id="pdf-qr-variable"
            label="Variable con la imagen"
            value={component.variable}
            prefix="{"
            suffix="}"
            onChange={(value) => update({ ...component, variable: cleanPdfVariable(value) })}
          />
          <PdfNumberField
            id="pdf-qr-size"
            label="Tamaño (es cuadrado)"
            value={component.size}
            min={1}
            suffix="px"
            onChange={(size) => size && update({ ...component, size })}
          />
          <p className="text-[11px] text-fg-muted">
            Qué codifica lo define el back con cada municipio; aquí solo se reserva el lugar.
          </p>
        </>
      )}

      {component.type === 'stamp' && (
        <>
          <PdfImageSourceField
            id="pdf-stamp-src"
            label="Imagen del sello"
            src={component.src}
            display={{ width: component.width, height: component.height }}
            onChange={(src) => update({ ...component, src })}
          />
          <div className="grid grid-cols-2 gap-2">
            <PdfNumberField
              id="pdf-stamp-width"
              label="Ancho"
              value={component.width}
              min={1}
              suffix="px"
              onChange={(width) => width && update({ ...component, width })}
            />
            <PdfNumberField
              id="pdf-stamp-height"
              label="Alto"
              value={component.height}
              placeholder="Auto"
              min={1}
              suffix="px"
              onChange={(height) => update(withOptional(component, 'height', height))}
            />
          </div>
          <PdfTextField
            id="pdf-stamp-text"
            label="Texto encima"
            value={component.text}
            onChange={(text) => update({ ...component, text })}
          />
          <div className="grid grid-cols-3 gap-2">
            <PdfNumberField
              id="pdf-stamp-font-size"
              label="Letra"
              value={component.fontSize}
              min={1}
              suffix="px"
              onChange={(fontSize) => fontSize && update({ ...component, fontSize })}
            />
            <PdfNumberField
              id="pdf-stamp-top"
              label="Arriba"
              value={component.top}
              min={0}
              max={100}
              suffix="%"
              onChange={(top) => update({ ...component, top: clampPercent(top) })}
            />
            <PdfNumberField
              id="pdf-stamp-left"
              label="Izquierda"
              value={component.left}
              min={0}
              max={100}
              suffix="%"
              onChange={(left) => update({ ...component, left: clampPercent(left) })}
            />
          </div>
          <button
            type="button"
            onClick={() => update({ ...component, top: 50, left: 50 })}
            disabled={component.top === 50 && component.left === 50}
            className={`${PANEL_BUTTON_CLASSES} self-start`}
          >
            Centrar el texto
          </button>
        </>
      )}
    </>
  )
}

// undefined borra la clave: el JSON del .html no lleva nulls ni claves vacias.
function withOptional<T extends PdfComponent, K extends keyof T>(
  component: T,
  key: K,
  value: T[K] | undefined,
): T {
  const next: T = { ...component }
  if (value === undefined) delete next[key]
  else next[key] = value
  return next
}

function clampPercent(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 50
  return Math.min(100, Math.max(0, value))
}
