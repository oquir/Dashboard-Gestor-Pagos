// Qué puede hacer cada rol. Ajustar aquí cambia menús, botones y rutas.
import type { Role } from '../types'

export type Permission =
  | 'canSeeAllMunicipalities'
  | 'manageMunicipalities'
  | 'manageUsers'
  | 'editSettings'
  /** Aprobar o rechazar novedades del RIT y declaraciones con aprobación previa. */
  | 'review'
  | 'canSeeReports'
  /** Descargar la plantilla y cargar desde Excel las actividades y tarifas de un año gravable. */
  | 'loadActivities'
  /** Registrar el pago en efectivo que el contribuyente hace en la ventanilla del municipio. */
  | 'recordTellerPayment'
  /** Ver quién hizo cada cambio y cuándo, en todos los municipios. */
  | 'canSeeAuditLog'
  /** Ver en Inicio la alerta de ReteICA y AutoReteICA sin consignar, que puede ser delito (art. 402 del Código Penal). */
  | 'canSeeUnremittedAlert'
  /** Abrir el orquestador de formularios, donde se arma el formulario de cada municipio. */
  | 'openFormBuilder'

const PERMISSIONS: Record<Permission, Role[]> = {
  canSeeAllMunicipalities: ['1cero1'],
  manageMunicipalities: ['1cero1'],
  manageUsers: ['1cero1', 'municipality_admin'],
  editSettings: ['1cero1', 'municipality_admin'],
  // La revisión es un acto de la administración municipal, no del proveedor.
  review: ['municipality_admin', 'official'],
  canSeeReports: ['1cero1', 'municipality_admin'],
  // Los funcionarios solo consultan las actividades.
  loadActivities: ['1cero1', 'municipality_admin'],
  // El efectivo lo recibe el municipio; 1cero1 solo habilita la opción.
  recordTellerPayment: ['municipality_admin', 'official'],
  // Con la bitácora, 1cero1 le responde al municipio quién hizo un cambio; el municipio no la ve.
  canSeeAuditLog: ['1cero1'],
  // Lo jurídico de lo que no se consigna lo atiende el municipio, no 1cero1.
  canSeeUnremittedAlert: ['municipality_admin', 'official'],
  // Los formularios los arma 1cero1; el municipio solo los usa.
  openFormBuilder: ['1cero1'],
}

export const can = (role: Role | undefined, permission: Permission) =>
  role !== undefined && PERMISSIONS[permission].includes(role)
