import type { IconComponent } from 'reicon-react'
import type { SidebarTab } from '../../../types'

export interface SidebarTabRailProps {
  tabs: { id: SidebarTab; label: string; icon: IconComponent }[]
  // Las pestanas antes de las que va una raya: separa grupos de pestanas distintas.
  dividerBefore?: SidebarTab[]
  activeTab: SidebarTab
  onSelect: (tab: SidebarTab) => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}
