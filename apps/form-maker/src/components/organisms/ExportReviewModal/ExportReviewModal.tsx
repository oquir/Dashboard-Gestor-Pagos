import { Button } from '../../atoms'
import { ModalActions } from '../../atoms'
import { ModalShell } from '../../atoms'
import {
  ERROR_BADGE_CLASSES,
  ITEM_CLASSES,
  LIST_CLASSES,
  REVIEW_COPY,
  WARNING_BADGE_CLASSES,
} from './ExportReviewModal.constants'
import type { ExportReviewModalProps, ReviewCopy } from './ExportReviewModal.types'
import { summaryLabel } from './ExportReviewModal.utils'

export function ExportReviewModal({
  action,
  problems,
  hasErrors,
  onGoTo,
  onProceed,
  onClose,
}: ExportReviewModalProps) {
  const copy: ReviewCopy = REVIEW_COPY[action]

  return (
    <ModalShell
      maxWidthClassName="max-w-xl"
      title={copy.title}
      description={summaryLabel(problems)}
      onClose={onClose}
      footer={
        <ModalActions>
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-4 py-1.5 text-sm hover:cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={hasErrors}
            onClick={onProceed}
            className="px-4 py-1.5 text-sm hover:cursor-pointer"
          >
            {copy.actionLabel}
          </Button>
        </ModalActions>
      }
    >
      <ul className={LIST_CLASSES}>
        {problems.map((problem) => (
          <li key={problem.id} className={ITEM_CLASSES}>
            <span
              className={problem.severity === 'error' ? ERROR_BADGE_CLASSES : WARNING_BADGE_CLASSES}
            >
              {problem.severity === 'error' ? 'Error' : 'Aviso'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-800 dark:text-neutral-100">
                {problem.where}
              </p>
              <p className="mt-0.5 wrap-break-word text-xs text-slate-500 dark:text-neutral-400">
                {problem.message}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => onGoTo(problem)}
              className="shrink-0 px-2 py-1 text-xs hover:cursor-pointer"
            >
              Ir
            </Button>
          </li>
        ))}
      </ul>

      {hasErrors && (
        <p className="text-[11px] text-red-600 dark:text-red-400">{copy.blockedHint}</p>
      )}
    </ModalShell>
  )
}
