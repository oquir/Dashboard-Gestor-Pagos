import { Select } from '../../atoms'
import type { FilterProps } from './Filter.types'
import { optionEntries } from './Filter.utils'

/**
 * Lista desplegable para filtrar un listado. Las opciones van en el orden del objeto
 * (valor: texto); la de valor vacío es la que no filtra.
 */
export default function Filter<T extends string>({
  label,
  options,
  value,
  change,
}: FilterProps<T>) {
  return (
    // `w-auto!` gana sobre el `w-full` de los campos: el filtro mide lo que su texto, y así caben varios en una fila.
    <Select
      aria-label={label}
      className="w-auto!"
      value={value}
      onChange={(e) => change(e.target.value as T)}
    >
      {optionEntries(options).map(([v, text]) => (
        <option key={v} value={v}>
          {text}
        </option>
      ))}
    </Select>
  )
}
