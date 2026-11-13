import type { ReactNode } from 'react'

interface MarkProps {
  /** Contraído: solo el logo, en el mismo lugar que con la barra abierta. */
  collapsed?: boolean
  /** Botón a la derecha, como el de cerrar el cajón en pantallas angostas. */
  action?: ReactNode
}

/**
 * Logo y nombre del aplicativo, arriba del menú lateral. Mide lo mismo que la barra superior (h-16) para que sus bordes
 * queden en línea. El logo va centrado en una caja del ancho de la barra contraída (w-17): así no se mueve al contraer o
 * abrir el menú, y queda en el mismo eje que los íconos de las opciones. El botón para contraer está en la barra superior.
 */
export default function Mark({ collapsed = false, action }: MarkProps) {
  return (
    <div className="flex h-16 shrink-0 items-center border-b border-border pr-3">
      <span className="flex w-17 shrink-0 justify-center">
        <img src="/1cero1.svg" alt="1cero1" className="w-11" />
      </span>
      {!collapsed && (
        <p className="whitespace-nowrap text-[15px] font-semibold text-fg-strong">
          Gestor de Pagos
        </p>
      )}
      {action && <span className="ml-auto">{action}</span>}
    </div>
  )
}
