import { ArrowLeft } from 'reicon-react'
import { Button } from '../atoms'

interface MarkProps {
  /** Sin texto: en el estado contraído solo queda la imagen. */
  collapsed?: boolean
  onCollapse?: () => void
  /** Doble clic sobre la imagen para volver a mostrar la barra. */
  onExpand?: () => void
}

/** Logo y nombre del aplicativo en el menú lateral. */
export default function Mark({ collapsed, onCollapse, onExpand }: MarkProps) {
  const logo = (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg">
      <img src="/1cero1.svg" alt="1cero1" className="h-9 w-auto" />
    </span>
  )
  if (collapsed) {
    return (
      <div className="flex items-center px-3 py-5" title="Doble clic para mostrar el menú" onDoubleClick={onExpand}>
        {logo}
      </div>
    )
  }
  return (
      <div className="flex items-center gap-2 pl-3 pr-3 py-5">
        {logo}
        <div>
          <p className="text-sm font-semibold text-slate-900">Gestor de Pagos</p>
        </div>
        <Button variant="ghost" className="ml-auto" aria-label="Ocultar el menú" onClick={onCollapse} >
          <ArrowLeft className="size-4" />
        </Button>
      </div>
  )
}
