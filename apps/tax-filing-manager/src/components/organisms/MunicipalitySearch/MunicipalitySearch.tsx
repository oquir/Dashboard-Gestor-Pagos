import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { GlobalSearch, TickCircle } from 'reicon-react'
import { can, useSession } from '../../../lib'
import { useData } from '../../../store'
import { Badge, Card } from '../../atoms'
import { SearchBox } from '../../molecules'
import type { MunicipalitySearchProps } from './MunicipalitySearch.types'
import { municipalityOptions } from './MunicipalitySearch.utils'

/**
 * Con él, 1cero1 elige en cada vista el municipio que ve, o todos, buscándolo por su nombre; la elección sigue al cambiar
 * de vista. Mientras el campo tiene el foco se escribe la búsqueda; al salir vuelve a mostrar el elegido. Se maneja con
 * el ratón o con las flechas, Enter y Escape. Los usuarios de un municipio no lo ven.
 */
export default function MunicipalitySearch({
  all = true,
  inline = false,
}: MunicipalitySearchProps) {
  const { user, municipalityId: selected } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const pick = useData((s) => s.selectMunicipality)
  const id = useId()
  const field = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const { options, more } = municipalityOptions(municipalities, text, all)
  const current =
    municipalities.find((m) => m.id === selected)?.name ?? (all ? 'Todos los municipios' : '')
  const optionId = (municipalityId: string | null) => `${id}-${municipalityId ?? 'todos'}`

  if (!can(user?.role, 'canSeeAllMunicipalities')) return null

  const activeOnes = municipalities.filter((m) => m.isActive).length
  const choose = (municipalityId: string | null) => {
    pick(municipalityId)
    field.current?.blur()
  }

  const typeText = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      if (options.length > 0) setHighlighted((highlighted + step + options.length) % options.length)
    } else if (e.key === 'Enter' && options[highlighted]) {
      e.preventDefault()
      choose(options[highlighted].id)
    } else if (e.key === 'Escape') {
      field.current?.blur()
    }
  }

  const search = (
    <div className="relative">
      <SearchBox
        ref={field}
        icon={GlobalSearch}
        role="combobox"
        aria-label="Municipio"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-opciones`}
        aria-activedescendant={
          open && options[highlighted] ? optionId(options[highlighted].id) : undefined
        }
        autoComplete="off"
        placeholder="Buscar municipio por nombre"
        value={open ? text : current}
        onChange={(e) => {
          setText(e.target.value)
          setHighlighted(0)
        }}
        onFocus={() => {
          setOpen(true)
          // Sin texto, la lista empieza resaltando el que se está viendo.
          setHighlighted(
            Math.max(
              options.findIndex((o) => o.id === selected),
              0,
            ),
          )
        }}
        onBlur={() => {
          setOpen(false)
          setText('')
        }}
        onKeyDown={typeText}
      />
      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {options.length === 0 ? (
            <p className="px-3 py-4 text-sm text-fg-muted">Ningún municipio se llama así.</p>
          ) : (
            <ul
              id={`${id}-opciones`}
              role="listbox"
              aria-label="Municipios"
              className="max-h-80 overflow-y-auto py-1"
            >
              {options.map((o, i) => (
                <li
                  key={o.id ?? 'todos'}
                  id={optionId(o.id)}
                  role="option"
                  aria-selected={i === highlighted}
                  className={`flex cursor-pointer items-start gap-2 px-3 py-2 ${i === highlighted ? 'bg-brand-surface' : ''}`}
                  // Sin esto, el campo pierde el foco y la lista se cierra antes del clic.
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => choose(o.id)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-fg-strong">{o.name}</span>
                      {o.inactive && <Badge tone="neutral">Inactivo</Badge>}
                    </span>
                    <span className="block truncate text-xs text-fg-muted">{o.detail}</span>
                  </span>
                  {o.id === selected && (
                    <>
                      <TickCircle className="mt-0.5 size-4 shrink-0 text-brand-fg" aria-hidden />
                      <span className="sr-only">(el que estás viendo)</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          {more > 0 && (
            <p className="border-t border-border-subtle px-3 py-2 text-xs text-fg-muted">
              Hay {more} más: escribe más del nombre para encontrarlo.
            </p>
          )}
        </div>
      )}
    </div>
  )

  // En la fila de las fechas va como un campo más, con su etiqueta, sin tarjeta ni el conteo de abajo.
  if (inline)
    return (
      <div>
        <span className="mb-1 block text-sm font-medium text-fg">Municipio</span>
        {search}
      </div>
    )

  return (
    <Card className="mb-6 p-4">
      {search}
      <p className="mt-2 text-xs text-fg-muted">
        {municipalities.length} municipios en el aplicativo, {activeOnes} activos.
      </p>
    </Card>
  )
}
