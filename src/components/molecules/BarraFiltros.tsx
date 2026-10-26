import type { ReactNode } from 'react'

/** Fila de búsqueda y filtros sobre una tabla. */
export default function BarraFiltros({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">{children}</div>
}
