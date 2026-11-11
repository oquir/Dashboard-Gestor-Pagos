import type { CasillaProps } from './Casilla.types'

/** Casilla de verificación con el color de la marca. */
export default function Casilla({ pequena = false, className = '', ...props }: CasillaProps) {
  return (
    <input
      type="checkbox"
      className={`${pequena ? 'size-3.5' : 'size-4'} accent-brand-600 ${className}`}
      {...props}
    />
  )
}
