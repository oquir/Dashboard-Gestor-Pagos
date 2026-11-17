import { InfoCircle } from 'reicon-react'
import { Tooltip } from '../Tooltip'
import { BUBBLE_CLASSES, TRIGGER_CLASSES } from './InfoHint.constants'
import type { InfoHintProps } from './InfoHint.types'

// El texto sale con hover o con foco, y en pantalla tactil con un toque: lo resuelve Tooltip. Ya no
// depende de un ancestro posicionado ni de un clic que lo deje fijo.
export function InfoHint({ text, label }: InfoHintProps) {
  return (
    <Tooltip content={text} className={BUBBLE_CLASSES}>
      <button type="button" aria-label={label} className={TRIGGER_CLASSES}>
        <InfoCircle size={13} />
      </button>
    </Tooltip>
  )
}
