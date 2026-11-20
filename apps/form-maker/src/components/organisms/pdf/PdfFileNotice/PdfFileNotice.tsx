import { Xmark } from 'reicon-react'
import type { PdfFileNoticeProps } from './PdfFileNotice.types'
import { ENTER_RISE_CLASSES } from '../../../../constants'

export function PdfFileNotice({ notice, onDismiss }: PdfFileNoticeProps) {
  const isError: boolean = notice.tone === 'error'

  return (
    <div
      role="status"
      className={`flex shrink-0 ${ENTER_RISE_CLASSES} items-start gap-3 border-b px-6 py-2.5 text-xs ${
        isError
          ? 'border-danger-border bg-danger-surface text-danger'
          : 'border-brand-border bg-brand-surface text-fg-soft'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`font-semibold ${isError ? '' : 'text-fg-strong'}`}>{notice.title}</p>
        {notice.details.length > 0 && (
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {notice.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar el aviso"
        className="shrink-0 rounded p-0.5 text-fg-muted hover:cursor-pointer hover:text-fg"
      >
        <Xmark size={14} />
      </button>
    </div>
  )
}
