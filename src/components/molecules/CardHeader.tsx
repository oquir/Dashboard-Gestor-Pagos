import type { ReactNode } from 'react'

export default function CardHeader({ titulo, descripcion, acciones }: { titulo: string; descripcion?: string; acciones?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{titulo}</h2>
        {descripcion && <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>}
      </div>
      {acciones}
    </div>
  )
}
