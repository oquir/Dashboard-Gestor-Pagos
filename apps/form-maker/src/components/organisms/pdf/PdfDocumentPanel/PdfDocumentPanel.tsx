import {
  PANEL_BUTTON_CLASSES,
  PDF_BACK_MARGIN_MM,
  PDF_FONT_OPTIONS,
  PDF_MAX_EXTRA_MARGIN_MM,
  SELECT_CLASSES,
} from '../../../../constants'
import { factoryPdfDesign, hasFactoryPdfDesign } from '../../../../lib/pdfTemplates'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import type { PdfFontFamily, PdfMargins } from '../../../../types'
import { Label } from '../../../atoms'
import { PanelSection } from '../../../molecules'
import { PdfNumberField } from '../PdfNumberField'
import { MARGIN_SIDES } from './PdfDocumentPanel.constants'

// Lo que vale para todo el PDF: la letra y el margen. El margen que se escribe aca es el EXTRA; el
// total real (5 mm del back + el extra) se muestra al lado para que nadie tenga que sumar.
export function PdfDocumentPanel() {
  const design = usePdfDesignStore((state) => state.design)
  const setMargins = usePdfDesignStore((state) => state.setMargins)
  const setFontFamily = usePdfDesignStore((state) => state.setFontFamily)
  const setFontSize = usePdfDesignStore((state) => state.setFontSize)
  const loadDesign = usePdfDesignStore((state) => state.loadDesign)
  if (!design) return null

  return (
    <>
      <PanelSection title="Letra">
        <div className="grid grid-cols-[1fr_88px] gap-2">
          <div className="min-w-0">
            <Label htmlFor="pdf-font-family" className="text-[11px]">
              Fuente
            </Label>
            <select
              id="pdf-font-family"
              value={design.fontFamily}
              onChange={(event) => setFontFamily(event.target.value as PdfFontFamily)}
              className={`${SELECT_CLASSES} w-full`}
            >
              {PDF_FONT_OPTIONS.map((option) => (
                <option
                  key={option.family}
                  value={option.family}
                  style={{ fontFamily: option.stack }}
                >
                  {option.family}
                </option>
              ))}
            </select>
          </div>
          <PdfNumberField
            id="pdf-font-size"
            label="Tamaño"
            value={design.fontSize}
            min={1}
            suffix="px"
            onChange={(value) => value !== undefined && setFontSize(value)}
          />
        </div>
        <p className="text-[11px] text-fg-subtle">
          Solo fuentes básicas: el servidor que arma el PDF tiene que tenerlas.
        </p>
      </PanelSection>

      <PanelSection
        title="Margen extra"
        description={`El back ya deja ${PDF_BACK_MARGIN_MM} mm en cada lado de cada hoja. Lo que escribas aquí se suma a esos ${PDF_BACK_MARGIN_MM} mm. Úsalo cuando un municipio diga que la declaración sale pegada al borde.`}
      >
        <div className="grid grid-cols-2 gap-2">
          {MARGIN_SIDES.map(({ side, label }) => (
            <div key={side}>
              <PdfNumberField
                id={`pdf-margin-${side}`}
                label={label}
                value={design.margins[side]}
                max={PDF_MAX_EXTRA_MARGIN_MM}
                step={0.5}
                suffix="mm"
                onChange={(value) => setMargins({ [side]: value ?? 0 } as Partial<PdfMargins>)}
              />
              <p className="mt-0.5 text-[10px] text-fg-subtle tabular-nums">
                Total: {formatMm(PDF_BACK_MARGIN_MM + design.margins[side])} mm
              </p>
            </div>
          ))}
        </div>
      </PanelSection>

      {hasFactoryPdfDesign(design.taxType) && (
        <PanelSection
          title="Plantilla de fábrica"
          description="El formulario único nacional en una hoja carta, con las variables que hoy llena el back. Reemplaza el diseño de ahora; Ctrl+Z lo devuelve."
        >
          <button
            type="button"
            onClick={() => {
              const factory = factoryPdfDesign(design.taxType)
              if (factory) loadDesign(factory, null)
            }}
            className={`${PANEL_BUTTON_CLASSES} self-start`}
          >
            Cargar la plantilla de fábrica
          </button>
        </PanelSection>
      )}
    </>
  )
}

function formatMm(mm: number): string {
  return Number.isInteger(mm) ? String(mm) : mm.toFixed(1).replace('.', ',')
}
