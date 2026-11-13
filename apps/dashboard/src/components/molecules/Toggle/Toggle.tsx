import { InfoCircle } from 'reicon-react'
import { Switch } from '../../atoms'
import Tooltip from '../Tooltip'
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
          {info && (
            <Tooltip content={info} placement="bottom-start" className="w-72">
              <button
                type="button"
                aria-label={`Más información: ${label}`}
                // Está dentro del label: sin esto, el clic cambiaría el interruptor.
                onClick={(e) => e.preventDefault()}
                className="rounded-full p-0.5 text-fg-subtle hover:text-fg-strong focus-visible:outline-2 focus-visible:outline-brand-border"
              >
                <InfoCircle className="size-4" aria-hidden />
              </button>
            </Tooltip>
          )}
        </span>
        {help && <span className="block text-xs text-fg-muted">{help}</span>}
      </span>
    </label>
  )
}
