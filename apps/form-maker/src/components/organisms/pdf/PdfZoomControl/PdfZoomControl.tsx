import { useRef, useState } from 'react'
import { AngleDown2, Check, Minus, Plus } from 'reicon-react'
import { PDF_ZOOM_MAX, PDF_ZOOM_MIN, PDF_ZOOM_PRESETS } from '../../../../constants'
import { useClickOutside } from '../../../../hooks'
import { formatZoom } from '../../../../lib'
import { stepPdfZoom } from '../../../../lib/pdfDesign'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import { Tooltip } from '../../../atoms'
import {
  MENU_CLASSES,
  ZOOM_ITEM_CLASSES,
  ZOOM_SHORTCUT_CLASSES,
  ZOOM_STEP_CLASSES,
  ZOOM_TRIGGER_CLASSES,
} from './PdfZoomControl.constants'

// El zoom del lienzo del PDF: − y + a la vista (el usuario no encontraba como acercar) y, en el
// porcentaje, un menu con saltos fijos. Ctrl + rueda y Ctrl + / - / 0 hacen lo mismo.
export function PdfZoomControl() {
  const zoom = usePdfDesignStore((state) => state.zoom)
  const setZoom = usePdfDesignStore((state) => state.setZoom)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useClickOutside(containerRef, () => setIsOpen(false), isOpen)

  function apply(value: number): void {
    setZoom(value)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-0.5">
      <Tooltip content="Alejar (Ctrl −)">
        <span className="inline-flex">
          <button
            type="button"
            onClick={() => setZoom(stepPdfZoom(zoom, -1))}
            disabled={zoom <= PDF_ZOOM_MIN}
            aria-label="Alejar"
            className={ZOOM_STEP_CLASSES}
          >
            <Minus size={14} />
          </button>
        </span>
      </Tooltip>

      <Tooltip content="Zoom de las hojas">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className={ZOOM_TRIGGER_CLASSES}
        >
          {formatZoom(zoom)}
          <AngleDown2 size={12} />
        </button>
      </Tooltip>

      <Tooltip content="Acercar (Ctrl +)">
        <span className="inline-flex">
          <button
            type="button"
            onClick={() => setZoom(stepPdfZoom(zoom, 1))}
            disabled={zoom >= PDF_ZOOM_MAX}
            aria-label="Acercar"
            className={ZOOM_STEP_CLASSES}
          >
            <Plus size={14} />
          </button>
        </span>
      </Tooltip>

      {isOpen && (
        <div role="menu" className={MENU_CLASSES}>
          {PDF_ZOOM_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              role="menuitem"
              onClick={() => apply(preset)}
              className={ZOOM_ITEM_CLASSES}
            >
              <span className="tabular-nums">{formatZoom(preset)}</span>
              {preset === zoom ? (
                <Check size={12} weight="Filled" className="text-brand-fg" />
              ) : preset === 1 ? (
                <span className={ZOOM_SHORTCUT_CLASSES}>Ctrl 0</span>
              ) : null}
            </button>
          ))}
          <p className="border-t border-border-subtle px-2.5 pt-1.5 pb-1 text-[10px] text-fg-subtle">
            También con Ctrl + rueda del mouse.
          </p>
        </div>
      )}
    </div>
  )
}
