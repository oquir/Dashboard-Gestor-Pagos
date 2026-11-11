import type { BarraFiltrosProps } from './types'

export default function BarraFiltros({ buscador, acciones, children }: BarraFiltrosProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-60 flex-1">{buscador}</div>
        {acciones && <div className="flex shrink-0 flex-wrap items-center gap-3">{acciones}</div>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  )
}
