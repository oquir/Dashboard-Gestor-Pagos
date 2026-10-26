import { Search } from 'reicon-react'
import type { ComponentProps } from 'react'
import { Input } from '../atoms'

/** Campo de texto con lupa para buscar en un listado. `className` va al contenedor. */
export default function Buscador({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <Input className="pl-9" {...props} />
    </div>
  )
}
