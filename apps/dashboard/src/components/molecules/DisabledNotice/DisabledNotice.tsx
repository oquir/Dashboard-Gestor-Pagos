import { PauseCircle } from 'reicon-react'
import { formatDate } from '../../../lib'
import type { DisabledNoticeProps } from './DisabledNotice.types'

/** Tarjeta con el motivo por el que el municipio desactivó un formulario, quién lo hizo y cuándo. */
export default function DisabledNotice({
  disabled,
  meta,
  action,
  missingReason,
}: DisabledNoticeProps) {
  const line = meta ?? [formatDate(disabled.date), disabled.by].filter(Boolean).join(' · ')

  return (
    <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200 ring-inset">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-medium">
          <PauseCircle className="size-4 shrink-0" aria-hidden />
          Desactivado por el municipio
        </p>
        {action}
      </div>
      <p className="mt-1.5 text-slate-800">
        {disabled.reason ? (
          `“${disabled.reason}”`
        ) : (
          <span className="text-red-600">{missingReason}</span>
        )}
      </p>
      <p className="mt-1 text-xs text-amber-700">{line}</p>
    </div>
  )
}
