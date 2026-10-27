import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { TickCircle } from 'reicon-react'
import { puede } from '../../../lib/permisos'
import { useSesion } from '../../../lib/sesion'
import { useDatos } from '../../../store'
import { Badge, Card } from '../../atoms'
import { Buscador } from '../../molecules'
import type { BuscadorMunicipiosProps } from './types'
import { opcionesMunicipios } from './utils'

/**
 * Con él, 1cero1 elige en cada vista el municipio que ve, o todos, buscándolo por su nombre; la elección sigue al cambiar
 * de vista. Mientras el campo tiene el foco se escribe la búsqueda; al salir vuelve a mostrar el elegido. Se maneja con
 * el ratón o con las flechas, Enter y Escape. Los usuarios de un municipio no lo ven.
 */
export default function BuscadorMunicipios({ todos = true }: BuscadorMunicipiosProps) {
  const { usuario, municipioId: elegido } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const elegir = useDatos((s) => s.seleccionarMunicipio)
  const id = useId()
  const campo = useRef<HTMLInputElement>(null)
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [resaltado, setResaltado] = useState(0)
  const { opciones, mas } = opcionesMunicipios(municipios, texto, todos)
  const actual = municipios.find((m) => m.id === elegido)?.nombre ?? (todos ? 'Todos los municipios' : '')
  const idOpcion = (municipioId: string | null) => `${id}-${municipioId ?? 'todos'}`

  if (!puede(usuario?.rol, 'verTodosLosMunicipios')) return null

  const activos = municipios.filter((m) => m.activo).length
  const escoger = (municipioId: string | null) => {
    elegir(municipioId)
    campo.current?.blur()
  }

  const teclear = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const paso = e.key === 'ArrowDown' ? 1 : -1
      if (opciones.length > 0) setResaltado((resaltado + paso + opciones.length) % opciones.length)
    } else if (e.key === 'Enter' && opciones[resaltado]) {
      e.preventDefault()
      escoger(opciones[resaltado].id)
    } else if (e.key === 'Escape') {
      campo.current?.blur()
    }
  }

  return (
    <Card className="mb-6 p-4">
      <div className="relative">
        <Buscador
          ref={campo}
          role="combobox"
          aria-label="Municipio"
          aria-autocomplete="list"
          aria-expanded={abierto}
          aria-controls={`${id}-opciones`}
          aria-activedescendant={abierto && opciones[resaltado] ? idOpcion(opciones[resaltado].id) : undefined}
          autoComplete="off"
          placeholder="Buscar municipio por nombre"
          value={abierto ? texto : actual}
          onChange={(e) => {
            setTexto(e.target.value)
            setResaltado(0)
          }}
          onFocus={() => {
            setAbierto(true)
            // Sin texto, la lista empieza resaltando el que se está viendo.
            setResaltado(Math.max(opciones.findIndex((o) => o.id === elegido), 0))
          }}
          onBlur={() => {
            setAbierto(false)
            setTexto('')
          }}
          onKeyDown={teclear}
        />
        {abierto && (
          <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {opciones.length === 0 ? (
              <p className="px-3 py-4 text-sm text-slate-500">Ningún municipio se llama así.</p>
            ) : (
              <ul id={`${id}-opciones`} role="listbox" aria-label="Municipios" className="max-h-80 overflow-y-auto py-1">
                {opciones.map((o, i) => (
                  <li
                    key={o.id ?? 'todos'}
                    id={idOpcion(o.id)}
                    role="option"
                    aria-selected={i === resaltado}
                    className={`flex cursor-pointer items-start gap-2 px-3 py-2 ${i === resaltado ? 'bg-brand-50' : ''}`}
                    // Sin esto, el campo pierde el foco y la lista se cierra antes del clic.
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setResaltado(i)}
                    onClick={() => escoger(o.id)}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-slate-900">{o.nombre}</span>
                        {o.inactivo && <Badge tono="neutral">Inactivo</Badge>}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{o.detalle}</span>
                    </span>
                    {o.id === elegido && (
                      <>
                        <TickCircle className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                        <span className="sr-only">(el que estás viendo)</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {mas > 0 && <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">Hay {mas} más: escribe más del nombre para encontrarlo.</p>}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {municipios.length} municipios en el aplicativo, {activos} activos.
      </p>
    </Card>
  )
}
