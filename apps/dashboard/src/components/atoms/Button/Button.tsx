import { BUTTON_CLASSES } from './Button.constants'
import type { ButtonProps } from './Button.types'

export default function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
