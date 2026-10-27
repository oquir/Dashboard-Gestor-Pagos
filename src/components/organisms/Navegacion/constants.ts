import { Building2, ChartSquare, Document, AddressCard, Briefcase, Category, Setting, Users, Wallet } from 'reicon-react'
import type { EnlaceNavegacion } from './types'

export const NAVEGACION: EnlaceNavegacion[] = [
  { a: '/', texto: 'Inicio', icono: Category },
  { a: '/rit', texto: 'Inscripciones', icono: AddressCard },
  { a: '/declaraciones', texto: 'Declaraciones', icono: Document },
  { a: '/pagos', texto: 'Pagos', icono: Wallet },
  { a: '/reportes', texto: 'Reportes', icono: ChartSquare, permiso: 'verReportes' },
  { a: '/actividades', texto: 'Actividades', icono: Briefcase },
  { a: '/configuracion', texto: 'Configuración', icono: Setting },
  { a: '/usuarios', texto: 'Usuarios', icono: Users, permiso: 'gestionarUsuarios' },
  { a: '/municipios', texto: 'Municipios', icono: Building2, permiso: 'gestionarMunicipios' },
]
