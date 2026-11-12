import { useEffect, useId, useState } from 'react'
import { PauseCircle } from 'reicon-react'
import { formatDate } from '../../../lib'
import { TONE_CLASSES } from '../../atoms/Badge/Badge.constants'
import { BUBBLE_GAP, BUBBLE_WIDTH } from './DisabledBadge.constants'
import type { DisabledBadgeProps } from './DisabledBadge.types'

/**
 * Etiqueta "Desactivado" con el motivo en un globo: sale al pasar el mouse, al enfocarla con el
 * teclado o al tocarla. El globo va con position fixed porque las tablas lo recortarían con su scroll.
 */
export default function DisabledBadge({ disabled, meta }: DisabledBadgeProps) {
  const id = useId()
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  const open = (e: { currentTarget: HTMLElement }) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const left = Math.min(rect.left, window.innerWidth - BUBBLE_WIDTH - BUBBLE_GAP)
    setPosition({ top: rect.bottom + 6, left: Math.max(left, BUBBLE_GAP) })
  }
  const close = () => setPosition(null)

  // Escape lo cierra, y también el scroll: el globo es fijo y se quedaría atrás.
  useEffect(() => {
    if (!position) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
    }
  }, [position])

  const line = meta ?? [formatDate(disabled.date), disabled.by].filter(Boolean).join(' · ')

  return (
    <>
      <button
        type="button"
        aria-describedby={position ? id : undefined}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        onClick={open}
        className={`inline-flex cursor-help items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES.alert}`}
      >
        <PauseCircle className="size-3.5" aria-hidden />
        Desactivado
      </button>
      {position && (
        <div
          id={id}
          role="tooltip"
          style={{ top: position.top, left: position.left, width: BUBBLE_WIDTH }}
          className="fixed z-50 rounded-lg bg-inverse px-3 py-2 text-on-inverse shadow-lg"
        >
          <p className="text-sm">{disabled.reason ? `“${disabled.reason}”` : 'Sin motivo'}</p>
          <p className="mt-1 text-xs text-on-inverse-muted">{line}</p>
        </div>
      )}
    </>
  )
}
