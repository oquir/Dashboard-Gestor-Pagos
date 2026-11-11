import { Checkbox } from '../../atoms'
import type { CheckboxFilterProps } from './CheckboxFilter.types'

/**
 * Filtro de sí o no con forma de botón, del mismo alto que las listas de `Filtro`, para que se vean como una sola fila.
 * Al marcarlo se pinta con el color de la marca.
 */
export default function CheckboxFilter({ label, isChecked, change }: CheckboxFilterProps) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50 has-checked:bg-brand-50 has-checked:text-brand-700 has-checked:ring-brand-600 has-focus-visible:ring-2 has-focus-visible:ring-brand-600">
      <Checkbox
        className="rounded"
        checked={isChecked}
        onChange={(e) => change(e.target.checked)}
      />
      {label}
    </label>
  )
}
