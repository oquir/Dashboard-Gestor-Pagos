import { Calendar, CheckCircle, Code, Database, Layers, Link, Palette, Sliders } from 'reicon-react'
import type { SidebarTab } from '../../../types'
import type { SidebarTabItem } from './Sidebar.types'

export const TABS: SidebarTabItem[] = [
  { id: 'fields', label: 'Campos', icon: Layers },
  { id: 'attributes', label: 'Atributos', icon: Sliders },
  { id: 'validations', label: 'Validaciones', icon: CheckCircle },
  { id: 'styles', label: 'Estilos', icon: Palette },
  { id: 'logic', label: 'Lógica', icon: Code },
  { id: 'apiMapping', label: 'Mapeo API', icon: Link },
  { id: 'catalogs', label: 'Catálogos', icon: Database },
  { id: 'fechas', label: 'Fechas', icon: Calendar },
]

// Los bancos del simulador: no dependen del campo seleccionado ni viajan en el export.
export const BANK_TABS: SidebarTab[] = ['catalogs', 'fechas']

// Una raya antes de cada grupo de pestanas (paleta, campo, bancos).
export const RAIL_DIVIDER_BEFORE: SidebarTab[] = ['attributes', 'catalogs']

export const FIELD_TABS: SidebarTab[] = [
  'attributes',
  'validations',
  'styles',
  'logic',
  'apiMapping',
]
