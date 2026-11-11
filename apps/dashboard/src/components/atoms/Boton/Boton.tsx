import { CLASES_BOTON } from './constants'
import type { BotonProps } from './types'

export default function Boton({ variante = 'secundario', className = '', ...props }: BotonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50 ${CLASES_BOTON[variante]} ${className}`}
      {...props}
    />
  )
}
