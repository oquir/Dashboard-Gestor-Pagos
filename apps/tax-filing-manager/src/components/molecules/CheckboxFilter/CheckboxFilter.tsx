import { Checkbox } from '../../atoms'
import type { CheckboxFilterProps } from './CheckboxFilter.types'

/**
 * Filtro de sí o no con forma de botón, del mismo alto que las listas de `Filtro`, para que se vean como una sola fila.
 * Al marcarlo se pinta con el color de la marca.
 */
export default function CheckboxFilter({ label, isChecked, change }: CheckboxFilterProps) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-fg ring-1 ring-inset ring-border-strong transition-colors hover:bg-surface-sunken has-checked:bg-brand-surface has-checked:text-brand-fg has-checked:ring-brand-border has-focus-visible:ring-2 has-focus-visible:ring-brand-border">
      <Checkbox
        className="rounded"
        checked={isChecked}
        onChange={(e) => change(e.target.checked)}
      />
      {label}
    </label>
  )
}
