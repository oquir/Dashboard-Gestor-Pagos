import { Card } from '../../atoms'
import InfoTip from '../InfoTip'
import type { StatTileProps } from './StatTile.types'

export default function StatTile({
  label,
  value,
  detail,
  icon,
  isPositive = false,
  info,
}: StatTileProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-sm text-fg-muted">
          {label}
          {info && <InfoTip label={label} content={info} />}
        </p>
        {icon && <span className={isPositive ? 'text-secondary' : 'text-fg-subtle'}>{icon}</span>}
      </div>
      <p
        className={`text-3xl self-center font-semibold ${isPositive ? 'text-secondary-fg' : 'text-fg-strong'}`}
      >
        {value}
      </p>
      {detail && <div className="text-sm text-fg-muted">{detail}</div>}
    </Card>
  )
}
