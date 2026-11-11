import { Search } from 'reicon-react'
import type { IconComponent } from 'reicon-react'
import type { ComponentProps } from 'react'
import { Input } from '../atoms'

/** Campo de texto con lupa para buscar en un listado. `className` va al contenedor; `icono` cambia la lupa por otro. */
export default function SearchBox({
  className = '',
  icon: IconComponent = Search,
  ...props
}: ComponentProps<'input'> & { icon?: IconComponent }) {
  return (
    <div className={`relative ${className}`}>
      <IconComponent
        className="pointer-events-none absolute left-2 top-1/2 size-5.5 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <Input className="pl-9" {...props} />
    </div>
  )
}
