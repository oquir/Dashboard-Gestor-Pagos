import type { Variant } from './Button.types'

export const BUTTON_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover shadow-sm',
  secondary: 'bg-surface text-fg ring-1 ring-inset ring-border-strong hover:bg-surface-sunken',
  danger: 'bg-danger text-on-brand hover:bg-danger-hover shadow-sm',
  ghost: 'text-fg-soft hover:bg-surface-raised',
}
