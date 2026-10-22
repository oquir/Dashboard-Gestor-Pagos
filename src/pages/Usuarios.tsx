import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate } from 'react-router'
import Tabla from '../components/Tabla'
import { Badge, Boton, Campo, Card, CardHeader, Input, PageHeader, Select } from '../components/ui'
import { etiquetaRol, nombreCompleto } from '../lib/formato'
import { puede } from '../lib/permisos'
import { delMunicipio, useSesion } from '../lib/sesion'
import { ayudanteColumnas } from '../lib/tabla'
import { useDatos } from '../store'
import type { Municipio, Rol, Usuario } from '../types'

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

function NuevoUsuario({ alTerminar }: { alTerminar: () => void }) {
  const { usuario, municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const guardarUsuario = useDatos((s) => s.guardarUsuario)
  const es1cero1 = usuario?.rol === '1cero1'
  const rolesPermitidos: Rol[] = es1cero1 ? ['admin_municipio', 'funcionario', '1cero1'] : ['funcionario', 'admin_municipio']
  const [datos, setDatos] = useState({ nombres: '', apellidos: '', cargo: '', correo: '', rol: rolesPermitidos[0], municipioId: municipioId ?? municipios[0].id })
  const [intentado, setIntentado] = useState(false)

  const errores = {
    nombres: datos.nombres.trim() ? undefined : 'Escribe los nombres.',
    apellidos: datos.apellidos.trim() ? undefined : 'Escribe los apellidos.',
    correo: /^\S+@\S+\.\S+$/.test(datos.correo) ? undefined : 'Escribe un correo válido.',
  }

  const guardar = () => {
    setIntentado(true)
    if (errores.nombres || errores.apellidos || errores.correo) return
    const nuevo: Usuario = {
      id: `u${Date.now()}`,
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      cargo: datos.cargo.trim() || etiquetaRol[datos.rol],
      correo: datos.correo.trim(),
      rol: datos.rol,
      municipioId: datos.rol === '1cero1' ? null : es1cero1 ? datos.municipioId : (usuario?.municipioId ?? null),
      activo: true,
    }
    guardarUsuario(nuevo)
    alTerminar()
  }

  return (
    <Card className="mb-6">
      <CardHeader titulo="Nuevo usuario" />
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <Campo etiqueta="Nombres" error={intentado ? errores.nombres : undefined}>
          <Input autoComplete="given-name" value={datos.nombres} onChange={(e) => setDatos({ ...datos, nombres: e.target.value })} />
        </Campo>
        <Campo etiqueta="Apellidos" error={intentado ? errores.apellidos : undefined}>
          <Input autoComplete="family-name" value={datos.apellidos} onChange={(e) => setDatos({ ...datos, apellidos: e.target.value })} />
        </Campo>
        <Campo etiqueta="Cargo">
          <Input placeholder="Ej.: Profesional de Rentas" value={datos.cargo} onChange={(e) => setDatos({ ...datos, cargo: e.target.value })} />
        </Campo>
        <Campo etiqueta="Correo" error={intentado ? errores.correo : undefined}>
          <Input type="email" value={datos.correo} onChange={(e) => setDatos({ ...datos, correo: e.target.value })} />
        </Campo>
        <Campo etiqueta="Rol">
          <Select value={datos.rol} onChange={(e) => setDatos({ ...datos, rol: e.target.value as Rol })}>
            {rolesPermitidos.map((r) => (
              <option key={r} value={r}>{etiquetaRol[r]}</option>
            ))}
          </Select>
        </Campo>
        {es1cero1 && datos.rol !== '1cero1' && (
          <Campo etiqueta="Municipio">
            <Select value={datos.municipioId} onChange={(e) => setDatos({ ...datos, municipioId: e.target.value })}>
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </Select>
          </Campo>
        )}
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
        <Boton variante="secundario" onClick={alTerminar}>Cancelar</Boton>
        <Boton variante="primario" onClick={guardar}>Crear usuario</Boton>
      </div>
    </Card>
  )
}

export default function Usuarios() {
  const { usuario, municipioId } = useSesion()
  const usuarios = useDatos((s) => s.usuarios)
  const municipios = useDatos((s) => s.municipios)
  const alternarUsuario = useDatos((s) => s.alternarUsuario)
  const [creando, setCreando] = useState(false)
  const columnas = useMemo(() => columnasUsuarios(municipios, usuario, alternarUsuario), [municipios, usuario, alternarUsuario])

  if (!puede(usuario?.rol, 'gestionarUsuarios')) return <Navigate to="/" replace />

  const lista = municipioId === null ? usuarios : delMunicipio(usuarios, municipioId)

  return (
    <>
      <PageHeader
        titulo="Usuarios"
        descripcion={usuario?.rol === '1cero1' ? 'Usuarios de todos los municipios y del equipo de 1cero1.' : 'Funcionarios y administradores de tu municipio.'}
        acciones={
          !creando && (
            <Boton variante="primario" onClick={() => setCreando(true)}>
              <Plus className="size-4" aria-hidden /> Nuevo usuario
            </Boton>
          )
        }
      />
      {creando && <NuevoUsuario alTerminar={() => setCreando(false)} />}
      <Card>
        <Tabla
          datos={lista}
          columnas={columnas}
          idFila={(u) => u.id}
          nombre="usuarios"
          claseFila={(u) => (u.activo ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-60')}
        />
      </Card>
    </>
  )
}
