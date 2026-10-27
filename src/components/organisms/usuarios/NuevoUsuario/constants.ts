import type { Rol } from '../../../../types'

/** Los roles que crea 1cero1; el primero es el que viene elegido. */
export const ROLES_1CERO1: Rol[] = ['admin_municipio', 'funcionario', '1cero1']
/** Los roles que crea el administrador del municipio; el primero es el que viene elegido. */
export const ROLES_MUNICIPIO: Rol[] = ['funcionario', 'admin_municipio']

export const PATRON_CORREO = /^\S+@\S+\.\S+$/
