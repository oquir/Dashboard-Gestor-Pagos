import { useFormStore } from '../../store/formStore'
import type { AppLayoutProps } from './AppLayout.types'

export function AppLayout({ sidebar, canvas, canvasOverlay, rightSidebar }: AppLayoutProps) {
  const isSidebarOpen: boolean = useFormStore((state) => state.isSidebarOpen)
  const isRightSidebarOpen: boolean = useFormStore((state) => state.isRightSidebarOpen)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-neutral-100">
      <aside
        className={`relative flex shrink-0 flex-col h-full overflow-hidden bg-white transition-all ease-in-out border-r border-slate-200 dark:bg-neutral-900 dark:border-neutral-800 ${
          isSidebarOpen ? 'w-80 shadow-sm' : 'w-14'
        }`}
      >
        <div className="w-80 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">{sidebar}</div>
        </div>
      </aside>

      {/* Al lado de main y no adentro: asi no se desplaza ni se escala con el lienzo.
          scrollbar-gutter estable porque el lienzo mide su raiz con el ancho del puerto. */}
      <div className="relative flex min-w-0 flex-1">
        <main
          data-canvas-scroll
          className="relative flex-1 overflow-auto bg-slate-100 bg-dot-grid scrollbar-gutter-stable dark:bg-neutral-950"
        >
          {canvas}
        </main>
        {canvasOverlay}
      </div>

      {/* Plegado no se renderiza (no w-0): seguiria montado CanvasTabs con zonas de soltar
          invisibles. No anima el ancho: dispararia el ResizeObserver del puerto en cada frame. */}
      {isRightSidebarOpen && (
        <aside className="animate-right-panel-in relative flex h-full w-80 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {rightSidebar}
        </aside>
      )}
    </div>
  )
}
