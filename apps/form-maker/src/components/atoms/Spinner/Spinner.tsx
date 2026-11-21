import { SPINNER_CLASSES } from './Spinner.constants'
import type { SpinnerProps } from './Spinner.types'

export function Spinner({ className = '' }: SpinnerProps) {
  return <span aria-hidden className={`${SPINNER_CLASSES} ${className}`} />
}
