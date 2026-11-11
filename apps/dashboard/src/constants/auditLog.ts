// Controlador, acción y endpoint de lo que la demo deja en la bitácora. Son nombres de ejemplo: los de verdad vienen del back.
import type { AuditLogEntry } from '../types'

export type LogRequest = Pick<AuditLogEntry, 'controller' | 'action' | 'endpoint'>

const request = (controller: string, action: string, endpoint: string): LogRequest => ({
  controller,
  action,
  endpoint,
})

export const REQUESTS = {
  logIn: request('Autenticacion', 'IniciarSesion', 'POST /api/autenticacion/login'),
  resolveRitChange: request(
    'Rit',
    'ResolverNovedad',
    'PUT /api/rit/{inscripcionId}/novedades/{novedadId}',
  ),
  resolveApproval: request(
    'Declaraciones',
    'ResolverAprobacion',
    'PUT /api/declaraciones/{id}/aprobacion',
  ),
  resolveCorrection: request(
    'Declaraciones',
    'ResolverCorreccion',
    'PUT /api/declaraciones/{id}/correccion',
  ),
  recordSummonses: request('Emplazamientos', 'Registrar', 'POST /api/emplazamientos'),
  removeSummons: request('Emplazamientos', 'Eliminar', 'DELETE /api/emplazamientos/{id}'),
  saveSettings: request(
    'Configuracion',
    'GuardarConfiguracion',
    'PUT /api/configuracion/{municipioId}',
  ),
  loadActivities: request(
    'Actividades',
    'CargarActividades',
    'POST /api/actividades/{municipioId}/{vigencia}',
  ),
  createUser: request('Usuarios', 'CrearUsuario', 'POST /api/usuarios'),
  editUser: request('Usuarios', 'EditarUsuario', 'PUT /api/usuarios/{id}'),
  changeUserStatus: request('Usuarios', 'CambiarEstado', 'PATCH /api/usuarios/{id}/estado'),
  removeUser: request('Usuarios', 'EliminarUsuario', 'DELETE /api/usuarios/{id}'),
  changeMunicipalityStatus: request(
    'Municipios',
    'CambiarEstado',
    'PATCH /api/municipios/{municipioId}/estado',
  ),
  changeModule: request(
    'Municipios',
    'CambiarModulo',
    'PATCH /api/municipios/{municipioId}/modulos',
  ),
  recordTellerPayment: request('Pagos', 'RegistrarPagoVentanilla', 'POST /api/pagos/ventanilla'),
  receiveCheck: request('Pagos', 'RecibirCheque', 'POST /api/pagos/cheques'),
  confirmCheck: request('Pagos', 'ConfirmarCheque', 'PUT /api/pagos/cheques/{id}/confirmar'),
  returnCheck: request('Pagos', 'DevolverCheque', 'PUT /api/pagos/cheques/{id}/devolver'),
} satisfies Record<string, LogRequest>

/** Los controladores de la bitácora, para el filtro. */
export const CONTROLLERS = [...new Set(Object.values(REQUESTS).map((p) => p.controller))].sort()
