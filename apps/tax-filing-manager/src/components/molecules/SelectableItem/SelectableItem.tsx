import { ChevronRight } from 'reicon-react'
import type { SelectableItemProps } from './SelectableItem.types'

/** Elemento de una lista que se elige con un clic; el elegido queda resaltado. */
export default function SelectableItem({ isActive, onClick, children }: SelectableItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-brand-border ${isActive ? 'bg-brand-surface' : 'hover:bg-surface-sunken'}`}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <ChevronRight
        className={`mt-0.5 size-4 shrink-0 ${isActive ? 'text-brand-fg' : 'text-fg-subtle'}`}
        aria-hidden
      />
    </button>
  )
}
