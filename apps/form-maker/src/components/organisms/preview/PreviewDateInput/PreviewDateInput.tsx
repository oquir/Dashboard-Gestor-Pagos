import { useRef } from 'react'
import { Calendar } from 'reicon-react'
import {
  datePattern,
  datePlaceholder,
  displayDateText,
  formatIsoValue,
  maskDateText,
  parseDateText,
} from '../../../../lib/dateFormat/dateFormat'
import {
  CALENDAR_BUTTON_CLASSES,
  NATIVE_CLASSES,
  PICKER_CLASSES,
} from './PreviewDateInput.constants'
import type { PreviewDateInputProps } from './PreviewDateInput.types'

// El input date no deja elegir formato: con formato pedido el texto lo dibujamos y el calendario es
// un input date invisible que se abre con showPicker.
export function PreviewDateInput({
  id,
  ariaLabel,
  format,
  withTime,
  value,
  min,
  max,
  disabled,
  className,
  onChange,
}: PreviewDateInputProps) {
  const pickerRef = useRef<HTMLInputElement | null>(null)
  const nativeType: 'date' | 'datetime-local' = withTime ? 'datetime-local' : 'date'

  if (format === undefined) {
    return (
      <input
        id={id}
        type={nativeType}
        aria-label={ariaLabel}
        min={min}
        max={max}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${className} ${NATIVE_CLASSES}`}
      />
    )
  }

  const pattern: string = datePattern(format, withTime)
  const isComplete: boolean = formatIsoValue(value, pattern, withTime) !== null

  // Completo y valido se guarda AAAA-MM-DD; a medio escribir o imposible, el texto tal cual, que el
  // schema rechaza.
  function handleTextChange(text: string): void {
    const masked: string = maskDateText(text, pattern)
    onChange(parseDateText(masked, pattern) ?? masked)
  }

  // showPicker puede fallar; queda el foco, y el input nativo se usa con teclado.
  function openPicker(): void {
    const picker: HTMLInputElement | null = pickerRef.current
    if (!picker) return

    try {
      picker.showPicker()
    } catch {
      picker.focus()
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        placeholder={datePlaceholder(pattern)}
        disabled={disabled}
        value={displayDateText(value, pattern, withTime)}
        onChange={(event) => handleTextChange(event.target.value)}
        className={`${className} pr-10`}
      />
      <input
        ref={pickerRef}
        type={nativeType}
        tabIndex={-1}
        aria-hidden="true"
        min={min}
        max={max}
        disabled={disabled}
        value={isComplete ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        className={PICKER_CLASSES}
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        aria-label="Abrir calendario"
        title="Abrir calendario"
        className={CALENDAR_BUTTON_CLASSES}
      >
        <Calendar size={14} />
      </button>
    </div>
  )
}
