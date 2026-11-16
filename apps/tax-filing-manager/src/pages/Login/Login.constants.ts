import type { Role } from '../../types'

export const ROLE_DESCRIPTION: Record<Role, string> = {
  '1cero1':
    'Proveedor del aplicativo: ve todos los municipios, los configura y gestiona sus administradores.',
  municipality_admin:
    'Secretario de Hacienda o de Tesorería: configura su municipio, gestiona funcionarios y revisa.',
  official: 'Revisa inscripciones del RIT y declaraciones de su municipio.',
}

export const ORDER: Role[] = ['1cero1', 'municipality_admin', 'official']
