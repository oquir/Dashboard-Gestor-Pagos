import type { Municipio, Rol } from '../../../../types'

/** Lo que se escribe al crear o editar un usuario. */
export interface DatosUsuario {
  nombres: string
  apellidos: string
  cargo: string
  correo: string
  rol: Rol
  municipioId: string
}

export interface CamposUsuarioProps {
  datos: DatosUsuario
  cambiar: (datos: DatosUsuario) => void
  /** Los errores se muestran solo después de intentar guardar. */
  mostrarErrores: boolean
  roles: Rol[]
  /** Solo 1cero1 elige el municipio; si no se pasan, el campo no aparece. */
  municipios?: Municipio[]
  /** Clases de la rejilla, para que quepa en una tarjeta ancha o en una ventana angosta. */
  className?: string
}
