import { useRef } from 'react'
import {
  INPUT_CLASSES,
  PANEL_BUTTON_CLASSES,
  PANEL_DANGER_LINK_CLASSES,
  WARNING_BANNER_CLASSES,
} from '../../../../constants'
import { usePdfImageCheck } from '../../../../hooks/usePdfImageCheck'
import { pdfImageWarnings } from '../../../../lib/pdfComponents'
import type { PdfImageCheck } from '../../../../types'
import { Label } from '../../../atoms'
import type { PdfImageSourceFieldProps } from './PdfImageSourceField.types'
import { ACCEPTED_IMAGES, BASE64_PREFIX } from './PdfImageSourceField.constants'

// La imagen de un componente (imagen o sello): se pega la URL del servidor de imagenes, un base64
// o una {variable} que llena el back. FormMaker no sube imagenes (docs/Pendientes-PDF.md §2.1);
// "Elegir archivo" solo la lee del equipo y la pasa a base64, sin mandarla a ningun lado. Debajo, los
// avisos: WebP, mas grande de lo que se muestra, un base64 pesado o una ruta que no sirve.
export function PdfImageSourceField({
  id,
  label,
  src,
  display,
  onChange,
}: PdfImageSourceFieldProps) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const check: PdfImageCheck = usePdfImageCheck(src)
  const warnings: string[] = pdfImageWarnings(src, check, display)
  const isBase64: boolean = BASE64_PREFIX.test(src)

  function readFile(file: File | undefined): void {
    if (!file) return
    const reader: FileReader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[11px]">
        {label}
      </Label>
      {isBase64 ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface-sunken px-2 py-1 text-[11px] text-fg-muted">
          <span className="min-w-0 flex-1 truncate">
            Imagen en base64 · {Math.round((src.length * 3) / 4 / 1024)} KB
          </span>
          <button type="button" onClick={() => onChange('')} className={PANEL_DANGER_LINK_CLASSES}>
            Quitar
          </button>
        </div>
      ) : (
        <input
          id={id}
          value={src}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          placeholder="https://… , data:image/png;base64,… o {variable}"
          className={`${INPUT_CLASSES} font-mono`}
        />
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={PANEL_BUTTON_CLASSES}
        >
          Elegir archivo…
        </button>
        <span className="text-[10px] text-fg-muted">
          {check.status === 'loading'
            ? 'Cargando…'
            : check.status === 'ok'
              ? `${check.naturalWidth} × ${check.naturalHeight} px`
              : 'Se guarda como base64'}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_IMAGES}
          className="hidden"
          onChange={(event) => {
            readFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
      </div>
      {warnings.map((warning) => (
        <p key={warning} className={WARNING_BANNER_CLASSES}>
          {warning}
        </p>
      ))}
    </div>
  )
}
