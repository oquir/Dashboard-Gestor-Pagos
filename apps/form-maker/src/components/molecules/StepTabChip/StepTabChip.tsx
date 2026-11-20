import { Tooltip } from '../../atoms/Tooltip'
import { useDroppable } from '@dnd-kit/core'
import { useEffect, useRef } from 'react'
import { Xmark } from 'reicon-react'
import { STEP_NAVIGATION_HINT } from '../../../constants/stepNavigation'
import type { StepTabChipProps } from './StepTabChip.types'
import { transferClasses } from './StepTabChip.utils'

export function StepTabChip({
  index,
  label,
  active,
  canvasTarget,
  transferState = 'idle',
  onSelect,
  onRemove,
  removeTitle,
  removeIconSize = 12,
  className = '',
}: StepTabChipProps) {
  // Solo acepta drops durante una mudanza que esta pestana puede recibir.
  const { setNodeRef, isOver } = useDroppable({
    id: `tab-${canvasTarget.type}-${canvasTarget.stepId}`,
    data: { canvasTarget },
    disabled: transferState !== 'ready',
  })
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  // Con Ctrl+flecha el paso cambia sin tocar la grilla: la pestana activa se trae a la vista.
  useEffect(() => {
    if (active) buttonRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active])

  // Todas son numero, la activa tambien: expandirla movia la grilla bajo el puntero durante un
  // arrastre.
  const chipClasses: string = active
    ? 'bg-brand-strong text-on-brand-strong ring-[3px] ring-brand/20'
    : 'bg-surface-raised text-fg-soft hover:bg-surface-inset hover:text-fg-strong'

  return (
    <div
      ref={setNodeRef}
      className={`relative shrink-0 rounded-md ${transferClasses(transferState, isOver)} ${className}`}
    >
      <Tooltip content={`${label}\n${STEP_NAVIGATION_HINT}`} className="whitespace-pre-line">
        <button
          ref={buttonRef}
          type="button"
          onClick={onSelect}
          aria-label={label}
          aria-current={active ? 'step' : undefined}
          className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums transition-colors hover:cursor-pointer ${chipClasses}`}
        >
          {index}
        </button>
      </Tooltip>

      {active && onRemove && (
        <Tooltip content={removeTitle}>
          <button
            type="button"
            aria-label={removeTitle}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="-right-1.5 -top-1.5 absolute flex h-4 w-4 items-center justify-center rounded-full border border-border bg-surface text-fg-subtle shadow-sm transition-colors hover:border-danger-soft hover:text-danger hover:cursor-pointer"
          >
            <Xmark size={removeIconSize} weight="Filled" />
          </button>
        </Tooltip>
      )}
    </div>
  )
}
