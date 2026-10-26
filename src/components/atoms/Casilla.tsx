import type { ComponentProps } from 'react'

/** Casilla de verificación con el color de la marca. */
export default function Casilla({ pequena = false, className = '', ...props }: Omit<ComponentProps<'input'>, 'type'> & { pequena?: boolean }) {
  return <input type="checkbox" className={`${pequena ? 'size-3.5' : 'size-4'} accent-brand-600 ${className}`} {...props} />
}
