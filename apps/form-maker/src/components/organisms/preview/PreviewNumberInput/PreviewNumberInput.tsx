import { useState } from 'react'
import { maxLengthOf } from '../../../../lib/fieldLength/fieldLength'
import { placeholderOf } from '../../../../lib/fieldPlaceholder/fieldPlaceholder'
import { applyDecimals, applyRounding } from '../../../../lib/fieldRounding/fieldRounding'
import { allowsNegative, clampNegative } from '../../../../lib/fieldSign/fieldSign'
import {
  capIntegerDigits,
  formatForDisplay,
  parseFormattedNumber,
  sanitizeNumericInput,
  toEditableText,
} from '../../../../lib/numberFormat/numberFormat'
import type { PreviewNumberInputProps } from './PreviewNumberInput.types'

export function PreviewNumberInput({
  field,
  value,
  disabled,
  inputId,
  className,
  onChange,
}: PreviewNumberInputProps) {
  // Lo tecleado vive aca solo mientras hay foco: sin esto, "1," se redibujaria desde el estado (1)
  // y la coma desapareceria.
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <input
      id={inputId}
      // No puede ser type="number": por spec el punto es el decimal, asi "1.000" vale 1 y "1.000,5"
      // deja el campo vacio. inputMode conserva el teclado numerico.
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholderOf(field)}
      disabled={disabled}
      value={draft ?? formatForDisplay(field, value)}
      onFocus={() => setDraft(toEditableText(value))}
      onChange={(event) => {
        // El tope cuenta digitos de la parte entera, no caracteres: el formato no le come digitos.
        const clean: string = capIntegerDigits(
          sanitizeNumericInput(event.target.value, allowsNegative(field), field.decimals),
          maxLengthOf(field),
        )
        setDraft(clean)
        // Al estado sale siempre un numero, nunca el texto.
        onChange(parseFormattedNumber(clean) ?? '')
      }}
      onBlur={() => {
        // null: nunca hubo foco. Sin esta guarda un blur programatico vaciaria el campo.
        if (draft === null) return

        // Millar, decimales y signo en el mismo orden que runtimeDerived. El signo se recorta
        // aunque el filtro ya impida el menos: el teclado no puede ser la unica barrera.
        const rounded: unknown = applyDecimals(
          field,
          applyRounding(field, parseFormattedNumber(draft) ?? ''),
        )
        const next: unknown = clampNegative(field, rounded).value
        setDraft(null)
        if (next !== value) onChange(next)
      }}
      className={className}
    />
  )
}
