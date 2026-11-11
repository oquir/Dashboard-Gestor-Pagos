import type { VacioProps } from './types'

export default function Vacio({ titulo, descripcion }: VacioProps) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-700">{titulo}</p>
      {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
    </div>
  )
}
