import type { IconComponent } from 'reicon-react'
import type { SidebarTab } from '../../../types'

export interface SidebarTabRailProps {
  tabs: { id: SidebarTab; label: string; icon: IconComponent }[]
  activeTab: SidebarTab
  onSelect: (tab: SidebarTab) => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
  // Panel plegado: solo entonces los iconos muestran su nombre en un globo.
  isCollapsed: boolean
}
