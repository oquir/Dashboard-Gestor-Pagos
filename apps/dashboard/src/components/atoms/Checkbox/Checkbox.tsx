import type { CheckboxProps } from './Checkbox.types'

/** Casilla de verificación con el color de la marca. */
export default function Checkbox({ small = false, className = '', ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={`${small ? 'size-3.5' : 'size-4'} accent-brand-600 ${className}`}
      {...props}
    />
  )
}
