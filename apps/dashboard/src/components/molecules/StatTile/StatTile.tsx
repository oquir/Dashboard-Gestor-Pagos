import { Card } from '../../atoms'
import type { StatTileProps } from './StatTile.types'

export default function StatTile({
  label,
  value,
  detail,
  icon,
  isPositive = false,
}: StatTileProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-fg-muted">{label}</p>
        {icon && <span className={isPositive ? 'text-secondary' : 'text-fg-subtle'}>{icon}</span>}
      </div>
      <p
        className={`mt-2 text-3xl font-semibold ${isPositive ? 'text-secondary-fg' : 'text-fg-strong'}`}
      >
        {value}
      </p>
      {detail && <div className="mt-1 text-sm text-fg-muted">{detail}</div>}
    </Card>
  )
}
