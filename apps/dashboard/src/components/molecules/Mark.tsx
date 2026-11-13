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
      <div className="group relative flex items-center px-3 py-5" onDoubleClick={onExpand}>
        {logo}
        <button type="button" aria-label="Mostrar el menú" title="Mostrar el menú" onClick={onExpand} className="absolute inset-0 z-10 hidden items-center justify-center bg-white group-hover:flex" >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M11.6801 14.62L14.2401 12.06L11.6801 9.5" stroke="#606060" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M4 12.0601H14.17" stroke="#606060" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M12 4C16.42 4 20 7 20 12C20 17 16.42 20 12 20" stroke="#606060" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </button>
      </div>
    )
  }
  return (
      <div className="flex items-center gap-2 px-3 py-5">
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
