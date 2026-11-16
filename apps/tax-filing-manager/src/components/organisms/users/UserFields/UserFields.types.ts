import type { Municipality, Role } from '../../../../types'

/** Lo que se escribe al crear o editar un usuario. */
export interface UserData {
  firstNames: string
  lastNames: string
  jobTitle: string
  email: string
  role: Role
  municipalityId: string
}

export interface UserFieldsProps {
  data: UserData
  change: (data: UserData) => void
  /** Los errores se muestran solo después de intentar guardar. */
  showErrors: boolean
  roles: Role[]
  /** Solo 1cero1 elige el municipio; si no se pasan, el campo no aparece. */
  municipalities?: Municipality[]
  /** Clases de la rejilla, para que quepa en una tarjeta ancha o en una ventana angosta. */
  className?: string
}
