import { Select } from '../atoms'

/**
 * Lista desplegable para filtrar un listado. Las opciones van en el orden del objeto
 * (valor: texto); la de valor vacío es la que no filtra.
 */
export default function Filtro<T extends string>({ etiqueta, opciones, valor, cambiar }: {
  etiqueta: string
  opciones: Record<T, string>
  valor: T
  cambiar: (valor: T) => void
}) {
  return (
    <Select aria-label={etiqueta} className="w-auto" value={valor} onChange={(e) => cambiar(e.target.value as T)}>
      {(Object.entries(opciones) as [T, string][]).map(([v, texto]) => (
        <option key={v} value={v}>{texto}</option>
      ))}
    </Select>
  )
}
