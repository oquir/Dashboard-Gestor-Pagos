// Controlador, acción y endpoint de lo que la demo deja en la bitácora. Son nombres de ejemplo: los de verdad vienen del back.
import type { RegistroBitacora } from '../types'

export type Peticion = Pick<RegistroBitacora, 'controlador' | 'accion' | 'endpoint'>

const peticion = (controlador: string, accion: string, endpoint: string): Peticion => ({ controlador, accion, endpoint })

export const PETICIONES = {
  iniciarSesion: peticion('Autenticacion', 'IniciarSesion', 'POST /api/autenticacion/login'),
  resolverNovedad: peticion('Rit', 'ResolverNovedad', 'PUT /api/rit/{inscripcionId}/novedades/{novedadId}'),
  resolverAprobacion: peticion('Declaraciones', 'ResolverAprobacion', 'PUT /api/declaraciones/{id}/aprobacion'),
  resolverCorreccion: peticion('Declaraciones', 'ResolverCorreccion', 'PUT /api/declaraciones/{id}/correccion'),
  guardarConfiguracion: peticion('Configuracion', 'GuardarConfiguracion', 'PUT /api/configuracion/{municipioId}'),
  cargarActividades: peticion('Actividades', 'CargarActividades', 'POST /api/actividades/{municipioId}/{vigencia}'),
  crearUsuario: peticion('Usuarios', 'CrearUsuario', 'POST /api/usuarios'),
  editarUsuario: peticion('Usuarios', 'EditarUsuario', 'PUT /api/usuarios/{id}'),
  cambiarEstadoUsuario: peticion('Usuarios', 'CambiarEstado', 'PATCH /api/usuarios/{id}/estado'),
  eliminarUsuario: peticion('Usuarios', 'EliminarUsuario', 'DELETE /api/usuarios/{id}'),
  cambiarEstadoMunicipio: peticion('Municipios', 'CambiarEstado', 'PATCH /api/municipios/{municipioId}/estado'),
  cambiarModulo: peticion('Municipios', 'CambiarModulo', 'PATCH /api/municipios/{municipioId}/modulos'),
  registrarPagoVentanilla: peticion('Pagos', 'RegistrarPagoVentanilla', 'POST /api/pagos/ventanilla'),
  recibirCheque: peticion('Pagos', 'RecibirCheque', 'POST /api/pagos/cheques'),
  confirmarCheque: peticion('Pagos', 'ConfirmarCheque', 'PUT /api/pagos/cheques/{id}/confirmar'),
  devolverCheque: peticion('Pagos', 'DevolverCheque', 'PUT /api/pagos/cheques/{id}/devolver'),
} satisfies Record<string, Peticion>

/** Los controladores de la bitácora, para el filtro. */
export const CONTROLADORES = [...new Set(Object.values(PETICIONES).map((p) => p.controlador))].sort()
