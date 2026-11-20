import { InfoCircle } from 'reicon-react'
import { Tooltip } from '../Tooltip'
import { BUBBLE_CLASSES, TRIGGER_CLASSES } from './InfoHint.constants'
import type { InfoHintProps } from './InfoHint.types'

export function InfoHint({ text, label }: InfoHintProps) {
  return (
    <Tooltip content={text} className={BUBBLE_CLASSES}>
      <button type="button" aria-label={label} className={TRIGGER_CLASSES}>
        <InfoCircle size={13} />
      </button>
    </Tooltip>
  )
}
