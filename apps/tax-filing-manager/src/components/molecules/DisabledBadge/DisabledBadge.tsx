import { PauseCircle } from 'reicon-react'
import { formatDate } from '../../../lib'
import { TONE_CLASSES } from '../../atoms/Badge/Badge.constants'
import Tooltip from '../Tooltip'
import type { DisabledBadgeProps } from './DisabledBadge.types'

/** Etiqueta "Desactivado" con el motivo, la fecha y quién lo desactivó en un globo. */
export default function DisabledBadge({ disabled, meta }: DisabledBadgeProps) {
  const line = meta ?? [formatDate(disabled.date), disabled.by].filter(Boolean).join(' · ')

  return (
    <Tooltip
      placement="bottom-start"
      className="w-72"
      content={
        <>
          <p className="text-sm">{disabled.reason ? `“${disabled.reason}”` : 'Sin motivo'}</p>
          <p className="mt-1 text-on-inverse-muted">{line}</p>
        </>
      }
    >
      <button
        type="button"
        className={`inline-flex cursor-help items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES.alert}`}
      >
        <PauseCircle className="size-3.5" aria-hidden />
        Desactivado
      </button>
    </Tooltip>
  )
}
