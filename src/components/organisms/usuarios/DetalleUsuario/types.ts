import type { Usuario } from '../../../../types'

export interface DetalleUsuarioProps {
  usuario: Usuario
  /** Nombre del municipio del usuario, o "Todos" si es de 1cero1. */
  municipio: string
  /** Si quien mira puede desactivarlo, eliminarlo y reenviarle las credenciales. */
  gestionable: boolean
  cerrar: () => void
}
