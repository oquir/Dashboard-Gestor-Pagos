import type { ReviewAction, ReviewCopy } from './ExportReviewModal.types'

export const LIST_CLASSES: string =
  'flex max-h-[60vh] flex-col divide-y divide-slate-100 overflow-y-auto rounded border border-slate-200 dark:divide-neutral-800 dark:border-neutral-700'

export const ITEM_CLASSES: string = 'flex items-start gap-3 px-3 py-2'

export const ERROR_BADGE_CLASSES: string =
  'mt-0.5 shrink-0 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400'

export const WARNING_BADGE_CLASSES: string =
  'mt-0.5 shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'

export const REVIEW_COPY: Record<ReviewAction, ReviewCopy> = {
  export: {
    title: 'Revisión antes de exportar',
    actionLabel: 'Exportar',
    blockedHint: 'Corrige los errores para exportar.',
  },
  upload: {
    title: 'Revisión antes de subir',
    actionLabel: 'Subir',
    blockedHint: 'Corrige los errores para subir el formulario.',
  },
}
