import { Link } from 'react-router'
import type { LinkItemProps } from './LinkItem.types'

/** Fila de una lista que lleva al detalle: título y detalle a la izquierda, estado o valor a la derecha. */
export default function LinkItem({ a, title, detail, right }: LinkItemProps) {
  return (
    <li>
      <Link to={a} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{title}</p>
          <p className="truncate text-xs text-slate-500">{detail}</p>
        </div>
        <div className="shrink-0 text-right">{right}</div>
      </Link>
    </li>
  )
}
