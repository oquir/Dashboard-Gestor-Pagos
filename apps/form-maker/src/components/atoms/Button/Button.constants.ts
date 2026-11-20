import type { ButtonVariant } from './Button.types'

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-strong text-on-brand-strong hover:bg-brand-strong/90',
  secondary: 'border border-border text-fg-soft hover:border-border-strong hover:text-fg-strong',
  ghost: 'text-fg-muted hover:bg-surface-raised',
}
