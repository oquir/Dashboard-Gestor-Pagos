import { Select } from '../../atoms'
import type { FiltroProps } from './types'
import { entradas } from './utils'

/**
 * Lista desplegable para filtrar un listado. Las opciones van en el orden del objeto
 * (valor: texto); la de valor vacío es la que no filtra.
 */
export default function Filtro<T extends string>({ etiqueta, opciones, valor, cambiar }: FiltroProps<T>) {
  return (
    <Select aria-label={etiqueta} className="w-auto" value={valor} onChange={(e) => cambiar(e.target.value as T)}>
      {entradas(opciones).map(([v, texto]) => (
        <option key={v} value={v}>{texto}</option>
      ))}
    </Select>
  )
}
