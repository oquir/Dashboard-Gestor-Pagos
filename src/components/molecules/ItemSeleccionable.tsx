import { ChevronRight } from 'reicon-react'
import type { ReactNode } from 'react'

/** Elemento de una lista que se elige con un clic; el elegido queda resaltado. */
export default function ItemSeleccionable({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-brand-600 ${activo ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <ChevronRight className={`mt-0.5 size-4 shrink-0 ${activo ? 'text-brand-600' : 'text-slate-400'}`} aria-hidden />
    </button>
  )
}
