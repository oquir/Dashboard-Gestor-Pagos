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

// El riel junta tres clases de pestana con iconos iguales (la paleta, las del campo y los bancos):
// una raya antes de cada grupo nuevo las separa sin agregar texto.
export const RAIL_DIVIDER_BEFORE: SidebarTab[] = ['attributes', 'catalogs']

// Las pestanas que editan el campo seleccionado, a diferencia de Campos, Catalogos y Fechas.
export const FIELD_TABS: SidebarTab[] = [
  'attributes',
  'validations',
  'styles',
  'logic',
  'apiMapping',
]
