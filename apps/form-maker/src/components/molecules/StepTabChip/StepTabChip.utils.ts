import type { TransferTabState } from '../../../types/transfer'

// Ring y no border: el borde ya marca la activa y las dos cosas se ven a la vez.
export function transferClasses(state: TransferTabState, isOver: boolean): string {
  if (state === 'rejected') return 'ring-2 ring-red-400 ring-offset-1 dark:ring-offset-neutral-900'

  if (state !== 'ready') return ''

  return isOver
    ? 'scale-105 ring-2 ring-brand ring-offset-2 dark:ring-offset-neutral-900'
    : 'ring-2 ring-brand/50 ring-offset-1 dark:ring-offset-neutral-900'
}
