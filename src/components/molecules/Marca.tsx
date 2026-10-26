import { Courthouse } from 'reicon-react'

/** Logo y nombre del aplicativo en el menú lateral. */
export default function Marca() {
  return (
    <div className="flex items-center gap-2 px-5 py-5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
        <Courthouse className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">Gestor de Pagos</p>
      </div>
    </div>
  )
}
