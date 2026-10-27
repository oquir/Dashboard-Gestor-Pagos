import type { ConmutadorProps } from './types'

/** Interruptor de encendido y apagado con el color de la marca. Por dentro es una casilla, así que se usa igual. */
export default function Conmutador({ className = '', ...props }: ConmutadorProps) {
  return (
    <span className={`relative inline-flex h-5 w-9 shrink-0 ${className}`}>
      <input type="checkbox" role="switch" className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0 disabled:cursor-not-allowed" {...props} />
      <span
        aria-hidden
        className="h-full w-full rounded-full bg-slate-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600 peer-disabled:opacity-50"
      />
      <span aria-hidden className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
    </span>
  )
}
