import type { ReactNode } from 'react'
import { Card } from '../atoms'

export default function StatTile({ etiqueta, valor, detalle, icono }: { etiqueta: string; valor: string; detalle?: ReactNode; icono?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{etiqueta}</p>
        {icono && <span className="text-slate-400">{icono}</span>}
      </div>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{valor}</p>
      {detalle && <div className="mt-1 text-sm text-slate-500">{detalle}</div>}
    </Card>
  )
}
