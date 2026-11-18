import { INPUT_CLASSES } from '../../../../constants'
import { Label } from '../../../atoms'
import type { PdfTextFieldProps } from './PdfTextField.types'

export function PdfTextField({
  id,
  label,
  value,
  placeholder,
  multiline = false,
  prefix,
  suffix,
  onChange,
}: PdfTextFieldProps) {
  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="text-[11px]">
        {label}
      </Label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${INPUT_CLASSES} h-16 resize-y`}
        />
      ) : (
        <div className="flex items-center gap-1">
          {prefix && (
            <span className="shrink-0 font-mono text-[11px] text-fg-subtle">{prefix}</span>
          )}
          <input
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            className={INPUT_CLASSES}
          />
          {suffix && (
            <span className="shrink-0 font-mono text-[11px] text-fg-subtle">{suffix}</span>
          )}
        </div>
      )}
    </div>
  )
}
