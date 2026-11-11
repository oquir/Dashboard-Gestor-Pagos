import { UserEdit } from 'reicon-react'
import { roleLabel, fullName, columnHelper } from '../../../../lib'
import type { Municipality, User } from '../../../../types'
import { Badge } from '../../../atoms'

const col = columnHelper<User>()

/** Nadie se cambia a sí mismo, y solo 1cero1 cambia a los de 1cero1. */
export function isManageable(u: User, current: User | null) {
  return u.id !== current?.id && (current?.role === '1cero1' || u.role !== '1cero1')
}

export function municipalityName(u: User, municipalities: Municipality[]) {
  return municipalities.find((m) => m.id === u.municipalityId)?.name ?? 'Todos'
}

export function userColumns(municipalities: Municipality[], canSee: (id: string) => void) {
  return col.columns([
    col.display({
      id: 'ver',
      header: '',
      meta: { classes: 'w-px' },
      cell: ({ row: { original: u } }) => (
        <button
          type="button"
          aria-label={`Ver a ${fullName(u)}`}
          title="Ver y editar"
          onClick={() => canSee(u.id)}
          className="inline-flex size-8 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm ring-1 ring-inset ring-slate-300 transition-colors hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <UserEdit className="size-4" aria-hidden />
        </button>
      ),
    }),
    col.accessor(fullName, {
      id: 'nombre',
      header: 'Nombre',
      cell: ({ row: { original: u } }) => (
        <>
          <p className="font-medium text-slate-900">{fullName(u)}</p>
          <p className="text-xs text-slate-500">
            {u.jobTitle} · {u.email}
          </p>
        </>
      ),
    }),
    col.accessor((u) => roleLabel[u.role], {
      id: 'rol',
      header: 'Rol',
      cell: ({ row: { original: u } }) => (
        <Badge tone={u.role === '1cero1' ? 'info' : 'neutral'}>{roleLabel[u.role]}</Badge>
      ),
    }),
    col.accessor((u) => municipalityName(u, municipalities), {
      id: 'municipio',
      header: 'Municipio',
      meta: { classes: 'whitespace-nowrap text-slate-700' },
    }),
    col.accessor((u) => (u.isActive ? 'Activo' : 'Inactivo'), {
      id: 'estado',
      header: 'Estado',
      cell: ({ row: { original: u } }) => (
        <Badge tone={u.isActive ? 'success' : 'neutral'}>
          {u.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    }),
  ])
}
