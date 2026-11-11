import { UserEdit } from 'reicon-react'
import { etiquetaRol, nombreCompleto } from '../../../../lib/formato'
import { ayudanteColumnas } from '../../../../lib/tabla'
import type { Municipio, Usuario } from '../../../../types'
import { Badge } from '../../../atoms'

const col = ayudanteColumnas<Usuario>()

/** Nadie se cambia a sí mismo, y solo 1cero1 cambia a los de 1cero1. */
export function esGestionable(u: Usuario, actual: Usuario | null) {
  return u.id !== actual?.id && (actual?.rol === '1cero1' || u.rol !== '1cero1')
}

export function nombreMunicipio(u: Usuario, municipios: Municipio[]) {
  return municipios.find((m) => m.id === u.municipioId)?.nombre ?? 'Todos'
}

export function columnasUsuarios(municipios: Municipio[], ver: (id: string) => void) {
  return col.columns([
    col.display({
      id: 'ver',
      header: '',
      meta: { clase: 'w-px' },
      cell: ({ row: { original: u } }) => (
        <button
          type="button"
          aria-label={`Ver a ${nombreCompleto(u)}`}
          title="Ver y editar"
          onClick={() => ver(u.id)}
          className="inline-flex size-8 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm ring-1 ring-inset ring-slate-300 transition-colors hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <UserEdit className="size-4" aria-hidden />
        </button>
      ),
    }),
    col.accessor(nombreCompleto, {
      id: 'nombre',
      header: 'Nombre',
      cell: ({ row: { original: u } }) => (
        <>
          <p className="font-medium text-slate-900">{nombreCompleto(u)}</p>
          <p className="text-xs text-slate-500">
            {u.cargo} · {u.correo}
          </p>
        </>
      ),
    }),
    col.accessor((u) => etiquetaRol[u.rol], {
      id: 'rol',
      header: 'Rol',
      cell: ({ row: { original: u } }) => <Badge tono={u.rol === '1cero1' ? 'info' : 'neutral'}>{etiquetaRol[u.rol]}</Badge>,
    }),
    col.accessor((u) => nombreMunicipio(u, municipios), {
      id: 'municipio',
      header: 'Municipio',
      meta: { clase: 'whitespace-nowrap text-slate-700' },
    }),
    col.accessor((u) => (u.activo ? 'Activo' : 'Inactivo'), {
      id: 'estado',
      header: 'Estado',
      cell: ({ row: { original: u } }) => <Badge tono={u.activo ? 'exito' : 'neutral'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>,
    }),
  ])
}
