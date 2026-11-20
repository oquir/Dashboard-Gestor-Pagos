import { lazy, Suspense } from 'react'
import { Label } from '../../atoms/Label/Label'
import { SCRIPT_TEXTAREA_CLASSES } from './ScriptInput.constants'
import type { ScriptInputProps } from './ScriptInput.types'

// CodeMirror va en un lazy: pesa mucho y solo sirve en la pestana Logica. El textarea sirve
// mientras baja.
const ScriptEditor = lazy(() =>
  import('../ScriptEditor/ScriptEditor').then((module) => ({ default: module.ScriptEditor })),
)

export function ScriptInput({
  id,
  label,
  value,
  rows = 6,
  maxRows = 18,
  knownNames,
  placeholder,
  onChange,
}: ScriptInputProps) {
  // 1,2rem por linea (12px con interlineado 1.6) mas el relleno.
  const alto = (lines: number): string => `${(lines * 1.2 + 0.75).toFixed(2)}rem`

  const minHeight: string = alto(rows)

  const maxHeight: string = alto(Math.max(rows, maxRows))

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>

      <Suspense
        fallback={
          <textarea
            id={id}
            rows={rows}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            className={SCRIPT_TEXTAREA_CLASSES}
          />
        }
      >
        <ScriptEditor
          id={id}
          ariaLabel={label}
          value={value}
          knownNames={knownNames}
          placeholder={placeholder}
          minHeight={minHeight}
          maxHeight={maxHeight}
          onChange={onChange}
        />
      </Suspense>
    </div>
  )
}
