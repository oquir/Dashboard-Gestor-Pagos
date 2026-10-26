import type { ReactNode } from 'react'
import { Link } from 'react-router'

/** Fila de una lista que lleva al detalle: título y detalle a la izquierda, estado o valor a la derecha. */
export default function ItemEnlace({ a, titulo, detalle, derecha }: { a: string; titulo: ReactNode; detalle: ReactNode; derecha: ReactNode }) {
  return (
    <li>
      <Link to={a} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{titulo}</p>
          <p className="truncate text-xs text-slate-500">{detalle}</p>
        </div>
        <div className="shrink-0 text-right">{derecha}</div>
      </Link>
    </li>
  )
}
