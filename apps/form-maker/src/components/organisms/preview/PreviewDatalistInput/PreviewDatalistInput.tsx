import { useId } from 'react'
import type { PreviewDatalistInputProps } from './PreviewDatalistInput.types'

// Id de useId y no del nombre: en un grupo repetible cada repeticion dibuja el mismo campo.
export function PreviewDatalistInput({
  inputId,
  suggestions,
  value,
  placeholder,
  maxLength,
  disabled,
  className,
  onChange,
}: PreviewDatalistInputProps) {
  const listId: string = useId()

  return (
    <>
      <input
        id={inputId}
        type="text"
        list={listId}
        autoComplete="off"
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      />
      <datalist id={listId}>
        {suggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </>
  )
}
