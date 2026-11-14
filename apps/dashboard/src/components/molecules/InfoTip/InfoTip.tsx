import { InfoCircle } from 'reicon-react'
import Tooltip from '../Tooltip'
import type { InfoTipProps } from './InfoTip.types'

/**
 * Ícono ⓘ que explica en un globo lo que tiene al lado. Se abre con el mouse, con el teclado y al tocarlo.
 * Puede ir dentro de un `<label>`: el clic no llega a él, así que no activa el control del label.
 */
export default function InfoTip({
  label,
  content,
  placement = 'bottom-start',
  className = 'w-72',
}: InfoTipProps) {
  return (
    <Tooltip content={content} placement={placement} className={className}>
      <button
        type="button"
        aria-label={`Más información: ${label}`}
        // Dentro de un label, sin esto el clic cambiaría el control.
        onClick={(e) => e.preventDefault()}
        className="rounded-full p-0.5 text-fg-subtle hover:text-fg-strong focus-visible:outline-2 focus-visible:outline-brand-border"
      >
        <InfoCircle className="size-4" aria-hidden />
      </button>
    </Tooltip>
  )
}
