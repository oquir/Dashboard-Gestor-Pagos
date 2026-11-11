import { Button } from '../../../atoms'
import type { DeclarationSelectionProps } from './DeclarationSelection.types'

/** Aparece al marcar declaraciones: dice cuántas hay marcadas y permite quitar la selección. La descarga va junto al buscador. */
export default function DeclarationSelection({
  declarations,
  removeItem,
}: DeclarationSelectionProps) {
  if (declarations.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-brand-100 bg-brand-50 px-4 py-2.5 text-sm">
      <span className="font-medium text-brand-800">
        {declarations.length}{' '}
        {declarations.length === 1 ? 'declaración seleccionada' : 'declaraciones seleccionadas'}
      </span>
      <Button variant="ghost" onClick={removeItem}>
        Quitar selección
      </Button>
    </div>
  )
}
