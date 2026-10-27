import type { BarraFiltrosProps } from './types'

/** Fila de búsqueda y filtros sobre una tabla. */
export default function BarraFiltros({ children }: BarraFiltrosProps) {
  return <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">{children}</div>
}
