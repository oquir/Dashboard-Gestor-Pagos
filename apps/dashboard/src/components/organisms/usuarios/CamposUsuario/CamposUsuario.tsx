import { etiquetaRol } from '../../../../lib/formato'
import type { Rol } from '../../../../types'
import { Input, Select } from '../../../atoms'
import { Campo } from '../../../molecules'
import type { CamposUsuarioProps } from './CamposUsuario.types'
import { erroresUsuario } from './CamposUsuario.utils'

/** Los campos de un usuario, los mismos al crearlo y al editarlo. */
export default function CamposUsuario({
  datos,
  cambiar,
  mostrarErrores,
  roles,
  municipios,
  className = 'grid gap-4 sm:grid-cols-2',
}: CamposUsuarioProps) {
  const errores: Partial<ReturnType<typeof erroresUsuario>> = mostrarErrores
    ? erroresUsuario(datos)
    : {}

  return (
    <div className={className}>
      <Campo etiqueta="Nombres" error={errores.nombres}>
        <Input
          autoComplete="given-name"
          value={datos.nombres}
          onChange={(e) => cambiar({ ...datos, nombres: e.target.value })}
        />
      </Campo>
      <Campo etiqueta="Apellidos" error={errores.apellidos}>
        <Input
          autoComplete="family-name"
          value={datos.apellidos}
          onChange={(e) => cambiar({ ...datos, apellidos: e.target.value })}
        />
      </Campo>
      <Campo etiqueta="Cargo">
        <Input
          placeholder="Ej.: Profesional de Rentas"
          value={datos.cargo}
          onChange={(e) => cambiar({ ...datos, cargo: e.target.value })}
        />
      </Campo>
      <Campo etiqueta="Correo" error={errores.correo}>
        <Input
          type="email"
          value={datos.correo}
          onChange={(e) => cambiar({ ...datos, correo: e.target.value })}
        />
      </Campo>
      <Campo etiqueta="Rol">
        <Select
          value={datos.rol}
          onChange={(e) => cambiar({ ...datos, rol: e.target.value as Rol })}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {etiquetaRol[r]}
            </option>
          ))}
        </Select>
      </Campo>
      {municipios && datos.rol !== '1cero1' && (
        <Campo etiqueta="Municipio">
          <Select
            value={datos.municipioId}
            onChange={(e) => cambiar({ ...datos, municipioId: e.target.value })}
          >
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </Select>
        </Campo>
      )}
    </div>
  )
}
