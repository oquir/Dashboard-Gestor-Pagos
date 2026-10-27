import type { Rol } from '../../types'

export const DESCRIPCION_ROL: Record<Rol, string> = {
  '1cero1': 'Proveedor del aplicativo: ve todos los municipios, los configura y gestiona sus administradores.',
  admin_municipio: 'Secretario de Hacienda o de Tesorería: configura su municipio, gestiona funcionarios y revisa.',
  funcionario: 'Revisa inscripciones del RIT y declaraciones de su municipio.',
}

export const ORDEN: Rol[] = ['1cero1', 'admin_municipio', 'funcionario']
