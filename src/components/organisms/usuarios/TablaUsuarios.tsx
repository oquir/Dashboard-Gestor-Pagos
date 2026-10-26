import { useMemo } from 'react'
import { etiquetaRol, nombreCompleto } from '../../../lib/formato'
import { useSesion } from '../../../lib/sesion'
import { ayudanteColumnas } from '../../../lib/tabla'
import { useDatos } from '../../../store'
import type { Municipio, Usuario } from '../../../types'
import { Badge, Boton, Card } from '../../atoms'
import Tabla from '../Tabla'

const col = ayudanteColumnas<Usuario>()

function columnasUsuarios(municipios: Municipio[], actual: Usuario | null, alternar: (id: string) => void) {
  return col.columns([
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
    col.accessor((u) => municipios.find((m) => m.id === u.municipioId)?.nombre ?? 'Todos', {
      id: 'municipio',
      header: 'Municipio',
      meta: { clase: 'whitespace-nowrap text-slate-700' },
    }),
    col.accessor((u) => (u.activo ? 'Activo' : 'Inactivo'), {
      id: 'estado',
      header: 'Estado',
      cell: ({ row: { original: u } }) => <Badge tono={u.activo ? 'exito' : 'neutral'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>,
    }),
    col.display({
      id: 'acciones',
      header: '',
      meta: { alinear: 'derecha' },
      cell: ({ row: { original: u } }) =>
        u.id !== actual?.id &&
        (actual?.rol === '1cero1' || u.rol !== '1cero1') && (
          <Boton variante="fantasma" onClick={() => alternar(u.id)}>
            {u.activo ? 'Desactivar' : 'Activar'}
          </Boton>
        ),
    }),
  ])
}

/** Usuarios con su rol y estado. Nadie se desactiva a sí mismo, y solo 1cero1 desactiva a los de 1cero1. */
export default function TablaUsuarios({ usuarios }: { usuarios: Usuario[] }) {
  const { usuario } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const alternarUsuario = useDatos((s) => s.alternarUsuario)
  const columnas = useMemo(() => columnasUsuarios(municipios, usuario, alternarUsuario), [municipios, usuario, alternarUsuario])

  return (
    <Card>
      <Tabla
        datos={usuarios}
        columnas={columnas}
        idFila={(u) => u.id}
        nombre="usuarios"
        claseFila={(u) => (u.activo ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-60')}
      />
    </Card>
  )
}
