import { HexColorPicker } from 'react-colorful'
import { useState } from 'react'
import { Input } from '../../atoms'
import { HEX_COLOR_PATTERN } from '../../../constants'
import type { ColorPickerFieldProps } from './ColorPickerField.types'

export default function ColorPickerField({ value, change, error }: ColorPickerFieldProps) {
  // El texto del input va aparte para poder escribir un hex inválido y mostrar el error.
  const [text, setText] = useState(value)

  const pick = (hex: string) => {
    setText(hex)
    change(hex)
  }
  const type = (v: string) => {
    setText(v)
    const hex = v.startsWith('#') ? v : `#${v}`
    if (HEX_COLOR_PATTERN.test(v)) change(hex.toLowerCase())
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-fg">Código de color</span>
        <Input
          value={text}
          onChange={(e) => type(e.target.value)}
          spellCheck={false}
          placeholder="#3a3b3b"
          aria-label="Código de color"
        />
        {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
      </label>
      {/* Área bidimensional + barra de tono (react-colorful trae los dos selectores circulares). */}
      <HexColorPicker
        color={value}
        onChange={pick}
        className="h-40! w-full!"
        aria-label="Elegir color"
      />

      {/* Vista previa circular + etiqueta + hex debajo. */}
      <div className="flex items-center gap-3">
        <span
          className="size-9 shrink-0 rounded-full border border-border shadow-sm"
          style={{ backgroundColor: value }}
          aria-hidden
        />
        <div>
          <p className="text-sm font-medium text-fg">Color Seleccionado</p>
          <p className="font-mono text-xs text-fg-muted">{value}</p>
        </div>
      </div>
    </div>
  )
}
