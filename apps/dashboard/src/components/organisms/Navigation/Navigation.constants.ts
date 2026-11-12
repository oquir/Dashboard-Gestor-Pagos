import {
  City,
  Calendar,
  ChartSquare,
  AddressCard,
  Briefcase,
  Category,
  History,
  Industry,
  Settings2,
  Users,
  Wallet,
} from 'reicon-react'
import type { NavigationLink } from './Navigation.types'

export const NAVIGATION: NavigationLink[] = [
  { a: '/', text: 'Inicio', icon: Category },
  { a: '/rit', text: 'Inscripciones', icon: AddressCard },
  { a: '/declaraciones', text: 'Declaraciones', icon: Industry },
  { a: '/pagos', text: 'Pagos', icon: Wallet },
  { a: '/reportes', text: 'Reportes', icon: ChartSquare, permission: 'canSeeReports' },
  { a: '/actividades', text: 'Actividades', icon: Briefcase },
  { a: '/calendario', text: 'Calendario', icon: Calendar },
  { a: '/configuracion', text: 'Configuración', icon: Settings2 },
  { a: '/usuarios', text: 'Usuarios', icon: Users, permission: 'manageUsers' },
  { a: '/municipios', text: 'Municipios', icon: City, permission: 'manageMunicipalities' },
  { a: '/bitacora', text: 'Bitácora', icon: History, permission: 'canSeeAuditLog' },
]
