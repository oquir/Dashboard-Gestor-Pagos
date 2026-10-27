// Qué puede hacer cada rol. Ajustar aquí cambia menús, botones y rutas.
import type { Rol } from '../types'

export type Permiso =
  | 'verTodosLosMunicipios'
  | 'gestionarMunicipios'
  | 'gestionarUsuarios'
  | 'editarConfiguracion'
  /** Aprobar o rechazar novedades del RIT y declaraciones con aprobación previa. */
  | 'revisar'
  | 'verReportes'
  /** Descargar la plantilla y cargar desde Excel las actividades y tarifas de un año gravable. */
  | 'cargarActividades'
  /** Registrar el pago en efectivo que el contribuyente hace en la ventanilla del municipio. */
  | 'registrarPagoVentanilla'

const PERMISOS: Record<Permiso, Rol[]> = {
  verTodosLosMunicipios: ['1cero1'],
  gestionarMunicipios: ['1cero1'],
  gestionarUsuarios: ['1cero1', 'admin_municipio'],
  editarConfiguracion: ['1cero1', 'admin_municipio'],
  // La revisión es un acto de la administración municipal, no del proveedor.
  revisar: ['admin_municipio', 'funcionario'],
  verReportes: ['1cero1', 'admin_municipio'],
  // Los funcionarios solo consultan las actividades.
  cargarActividades: ['1cero1', 'admin_municipio'],
  // El efectivo lo recibe el municipio; 1cero1 solo habilita la opción.
  registrarPagoVentanilla: ['admin_municipio', 'funcionario'],
}

export const puede = (rol: Rol | undefined, permiso: Permiso) => rol !== undefined && PERMISOS[permiso].includes(rol)
