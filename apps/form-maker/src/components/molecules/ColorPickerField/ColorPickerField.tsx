import { useRef, useState } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { useClickOutside } from '../../../hooks'
import { Label } from '../../atoms'
import type { ColorPickerFieldProps } from './ColorPickerField.types'

export function ColorPickerField({
  id,
  label,
  value,
  defaultColor,
  placeholder,
  align = 'left',
  onChange,
}: ColorPickerFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useClickOutside(containerRef, () => setIsOpen(false), isOpen)

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2 rounded-md border border-slate-200 px-1.5 py-1 focus-within:border-brand dark:border-neutral-700 dark:bg-neutral-800">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={`${label}: elegir del selector`}
          style={{ backgroundColor: value || defaultColor }}
          className="h-5 w-5 shrink-0 cursor-pointer rounded border border-slate-200 dark:border-neutral-600"
        />
        <HexColorInput
          id={id}
          color={value || defaultColor}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={`${label}: código hexadecimal`}
          spellCheck={false}
          className="w-full min-w-0 bg-transparent font-mono text-xs text-slate-700 uppercase outline-none dark:text-neutral-200"
        />
      </div>
      {/* El lado lo decide quien lo coloca: el overflow del panel recorta tambien en X y ningun
          z-index lo salva. */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <HexColorPicker color={value || defaultColor} onChange={onChange} />
        </div>
      )}
    </div>
  )
}
