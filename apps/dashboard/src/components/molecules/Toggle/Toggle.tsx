import { Switch } from '../../atoms'
import InfoTip from '../InfoTip'
import type { ToggleProps } from './Toggle.types'

/** Interruptor con su etiqueta, una ayuda opcional y, si hace falta explicar más, un globo con la información. */
export default function Toggle({
  label,
  help,
  info,
  value,
  onChange,
  isDisabled = false,
}: ToggleProps) {
  return (
    <label className="flex items-start gap-3">
      <Switch checked={value} disabled={isDisabled} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="flex items-center gap-1 text-sm font-medium text-fg">
          {label}
          {info && <InfoTip label={label} content={info} />}
        </span>
        {help && <span className="block text-xs text-fg-muted">{help}</span>}
      </span>
    </label>
  )
}
