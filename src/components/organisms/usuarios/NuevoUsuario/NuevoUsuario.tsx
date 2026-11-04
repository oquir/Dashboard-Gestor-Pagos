import { useState } from 'react'
import { etiquetaRol } from '../../../../lib/formato'
import { useSesion } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import type { Usuario } from '../../../../types'
import { Boton, Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import CamposUsuario, { erroresUsuario, hayErrores, ROLES_1CERO1, ROLES_MUNICIPIO } from '../CamposUsuario'
import type { DatosUsuario } from '../CamposUsuario'
import type { NuevoUsuarioProps } from './types'

/** Alta de un usuario: 1cero1 lo crea en cualquier municipio; el administrador, solo en el suyo. */
export default function NuevoUsuario({ alTerminar }: NuevoUsuarioProps) {
  const { usuario, municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const guardarUsuario = useDatos((s) => s.guardarUsuario)
  const es1cero1 = usuario?.rol === '1cero1'
  const roles = es1cero1 ? ROLES_1CERO1 : ROLES_MUNICIPIO
  const [datos, setDatos] = useState<DatosUsuario>({ nombres: '', apellidos: '', cargo: '', correo: '', rol: roles[0], municipioId: municipioId ?? municipios[0].id })
  const [intentado, setIntentado] = useState(false)

  const guardar = () => {
    setIntentado(true)
    if (hayErrores(erroresUsuario(datos))) return
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
      <div className="p-5">
        <CamposUsuario
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          datos={datos}
          cambiar={setDatos}
          mostrarErrores={intentado}
          roles={roles}
          municipios={es1cero1 ? municipios : undefined}
        />
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
        <Boton variante="secundario" onClick={alTerminar}>Cancelar</Boton>
        <Boton variante="primario" onClick={guardar}>Crear usuario</Boton>
      </div>
    </Card>
  )
}
