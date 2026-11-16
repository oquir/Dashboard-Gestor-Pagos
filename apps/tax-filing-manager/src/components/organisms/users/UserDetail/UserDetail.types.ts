import type { User } from '../../../../types'

export interface UserDetailProps {
  user: User
  /** Nombre del municipio del usuario, o "Todos" si es de 1cero1. */
  municipality: string
  /** Si quien mira puede desactivarlo, eliminarlo y reenviarle las credenciales. */
  manageable: boolean
  close: () => void
}
