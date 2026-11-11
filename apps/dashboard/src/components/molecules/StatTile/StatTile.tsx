import { Card } from '../../atoms'
import type { StatTileProps } from './StatTile.types'

export default function StatTile({ label, value, detail, icon }: StatTileProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{label}</p>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      {detail && <div className="mt-1 text-sm text-slate-500">{detail}</div>}
    </Card>
  )
}
