import type { Role } from '../../../../types'

/** Los roles que crea 1cero1; el primero es el que viene elegido. */
export const ROLES_1CERO1: Role[] = ['municipality_admin', 'official', '1cero1']
/** Los roles que crea el administrador del municipio; el primero es el que viene elegido. */
export const MUNICIPALITY_ROLES: Role[] = ['official', 'municipality_admin']

export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
