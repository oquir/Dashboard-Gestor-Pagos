import type { IconComponent } from 'reicon-react'
import type { SidebarTab } from '../../../types'

export interface SidebarTabRailProps {
  tabs: { id: SidebarTab; label: string; icon: IconComponent }[]
  dividerBefore?: SidebarTab[]
  activeTab: SidebarTab
  onSelect: (tab: SidebarTab) => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}
