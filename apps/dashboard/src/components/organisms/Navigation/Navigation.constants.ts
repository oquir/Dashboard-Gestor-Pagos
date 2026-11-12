import {
  City,
  Calendar,
  ChartSquare,
  AddressCard,
  Briefcase,
  Category,
  ClipboardText,
  History,
  Industry,
  Settings2,
  Users,
  Wallet,
} from 'reicon-react'
import { FORM_BUILDER_URL } from '../../../constants'
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
  {
    a: FORM_BUILDER_URL,
    text: 'Formularios',
    icon: ClipboardText,
    permission: 'openFormBuilder',
    external: true,
  },
]

export const LINK_BASE_CLASSES: string =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
export const LINK_ACTIVE_CLASSES: string = 'bg-brand-50 text-brand-700'
export const LINK_IDLE_CLASSES: string = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
