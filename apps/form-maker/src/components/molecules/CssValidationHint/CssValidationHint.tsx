import { unsupportedDeclarations } from '../../../lib'
import type { CssValidationHintProps } from './CssValidationHint.types'

// Solo avisa, nunca bloquea: otro navegador puede aceptar la declaracion.
export function CssValidationHint({ text }: CssValidationHintProps) {
  const unsupported: string[] = unsupportedDeclarations(text)
  if (unsupported.length === 0) return null

  return (
    <p className="text-[11px] text-amber-600 dark:text-amber-400">
      El navegador no reconoce: {unsupported.join(', ')}
    </p>
  )
}
