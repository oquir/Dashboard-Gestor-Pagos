// Qué puede hacer cada rol. Ajustar aquí cambia menús, botones y rutas.
import type { Rol } from '../types'

export type Permiso =
  | 'verTodosLosMunicipios'
  | 'gestionarMunicipios'
  | 'gestionarUsuarios'
  | 'editarConfiguracion'
  /** Aprobar o rechazar novedades del RIT y revisar declaraciones. */
  | 'revisar'
  | 'verReportes'

const PERMISOS: Record<Permiso, Rol[]> = {
  verTodosLosMunicipios: ['1cero1'],
  gestionarMunicipios: ['1cero1'],
  gestionarUsuarios: ['1cero1', 'admin_municipio'],
  editarConfiguracion: ['1cero1', 'admin_municipio'],
  // La revisión es un acto de la administración municipal, no del proveedor.
  revisar: ['admin_municipio', 'funcionario'],
  verReportes: ['1cero1', 'admin_municipio'],
}

export const puede = (rol: Rol | undefined, permiso: Permiso) => rol !== undefined && PERMISOS[permiso].includes(rol)
