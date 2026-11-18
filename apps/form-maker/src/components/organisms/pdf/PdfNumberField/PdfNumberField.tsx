import { useState } from 'react'
import { INPUT_CLASSES } from '../../../../constants'
import { Label } from '../../../atoms'
import type { PdfNumberFieldProps } from './PdfNumberField.types'

// Un numero de la barra lateral del PDF (px, mm). Vacio es "sin valor": hereda o vuelve a
// automatico. Mientras tiene el foco muestra lo que se teclea y no lo guardado: el store puede
// redondear (el margen va de a medio mm) y pisar el texto a mitad de escribirlo dejaria sin poder
// teclear "7," o "0.".
export function PdfNumberField({
  id,
  label,
  value,
  placeholder,
  suffix,
  min = 0,
  max,
  step = 1,
  onChange,
}: PdfNumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="text-[11px]">
        {label}
      </Label>
      <div className="flex items-center gap-1.5">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={draft ?? (value === undefined ? '' : String(value))}
          placeholder={placeholder}
          onChange={(event) => {
            const raw: string = event.target.value
            setDraft(raw)
            if (raw.trim() === '') return onChange(undefined)

            const parsed: number = Number(raw)
            if (Number.isFinite(parsed)) onChange(parsed)
          }}
          onBlur={() => setDraft(null)}
          className={INPUT_CLASSES}
        />
        {suffix && <span className="shrink-0 text-[11px] text-fg-subtle">{suffix}</span>}
      </div>
    </div>
  )
}
