import { useState } from 'react'
import { etiquetaRol } from '../../../../lib/formato'
import { useSesion } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import type { Rol, Usuario } from '../../../../types'
import { Boton, Card, Input, Select } from '../../../atoms'
import { Campo, CardHeader } from '../../../molecules'
import { PATRON_CORREO, ROLES_1CERO1, ROLES_MUNICIPIO } from './constants'
import type { NuevoUsuarioProps } from './types'

/** Alta de un usuario: 1cero1 lo crea en cualquier municipio; el administrador, solo en el suyo. */
export default function NuevoUsuario({ alTerminar }: NuevoUsuarioProps) {
  const { usuario, municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const guardarUsuario = useDatos((s) => s.guardarUsuario)
  const es1cero1 = usuario?.rol === '1cero1'
  const rolesPermitidos = es1cero1 ? ROLES_1CERO1 : ROLES_MUNICIPIO
  const [datos, setDatos] = useState({ nombres: '', apellidos: '', cargo: '', correo: '', rol: rolesPermitidos[0], municipioId: municipioId ?? municipios[0].id })
  const [intentado, setIntentado] = useState(false)

  const errores = {
    nombres: datos.nombres.trim() ? undefined : 'Escribe los nombres.',
    apellidos: datos.apellidos.trim() ? undefined : 'Escribe los apellidos.',
    correo: PATRON_CORREO.test(datos.correo) ? undefined : 'Escribe un correo válido.',
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
