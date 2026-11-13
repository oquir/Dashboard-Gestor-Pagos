import { compactFormat, formatPesos, isCompacted } from '../../../lib'
import Tooltip from '../Tooltip'
import type { AmountProps } from './Amount.types'

/** Monto corto de las cards ("$1,3 M"); si quedó abreviado, el Tooltip da el valor exacto en pesos. */
export default function Amount({ value }: AmountProps) {
  const text = `$${compactFormat(value)}`
  if (!isCompacted(value)) return <span className="tabular-nums">{text}</span>
  return (
    <Tooltip content={<span className="tabular-nums">{formatPesos(value)}</span>}>
      <span
        tabIndex={0}
        className="cursor-help rounded tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border"
      >
        {text}
      </span>
    </Tooltip>
  )
}
