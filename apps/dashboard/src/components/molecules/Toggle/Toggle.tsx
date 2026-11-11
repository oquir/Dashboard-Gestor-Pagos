import { Switch } from '../../atoms'
import type { ToggleProps } from './Toggle.types'

/** Interruptor con su etiqueta y una ayuda opcional, para encender o apagar una opción. */
export default function Toggle({ label, help, value, onChange, isDisabled = false }: ToggleProps) {
  return (
    <label className="flex items-start gap-3">
      <Switch checked={value} disabled={isDisabled} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {help && <span className="block text-xs text-slate-500">{help}</span>}
      </span>
    </label>
  )
}
