import { City, Calendar, ChartSquare, AddressCard, Briefcase, Category, History, Industry, Settings2, Users, Wallet } from 'reicon-react'
import type { EnlaceNavegacion } from './types'

export const NAVEGACION: EnlaceNavegacion[] = [
  { a: '/', texto: 'Inicio', icono: Category },
  { a: '/rit', texto: 'Inscripciones', icono: AddressCard },
  { a: '/declaraciones', texto: 'Declaraciones', icono: Industry },
  { a: '/pagos', texto: 'Pagos', icono: Wallet },
  { a: '/reportes', texto: 'Reportes', icono: ChartSquare, permiso: 'verReportes' },
  { a: '/actividades', texto: 'Actividades', icono: Briefcase },
  { a: '/calendario', texto: 'Calendario', icono: Calendar },
  { a: '/configuracion', texto: 'Configuración', icono: Settings2 },
  { a: '/usuarios', texto: 'Usuarios', icono: Users, permiso: 'gestionarUsuarios' },
  { a: '/municipios', texto: 'Municipios', icono: City, permiso: 'gestionarMunicipios' },
  { a: '/bitacora', texto: 'Bitácora', icono: History, permiso: 'verBitacora' },
]
