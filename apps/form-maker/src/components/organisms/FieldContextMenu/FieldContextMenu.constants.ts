import type { ContextMenuTab } from '../../../types'
import type { TabButtonGroupItem } from '../../../types'

export const CONTEXT_MENU_TABS: TabButtonGroupItem<ContextMenuTab>[] = [
  { tab: 'attributes', label: 'Atributos' },
  { tab: 'styles', label: 'Estilos' },
  { tab: 'validations', label: 'Validaciones' },
  { tab: 'logic', label: 'Lógica' },
  { tab: 'apiMapping', label: 'Mapeo API' },
]
