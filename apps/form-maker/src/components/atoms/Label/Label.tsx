import type { LabelProps } from './Label.types'

export function Label({ className = '', ...rest }: LabelProps) {
  return (
    <label
      className={`mb-1 block text-xs font-medium text-slate-500 dark:text-neutral-400 ${className}`}
      {...rest}
    />
  )
}
