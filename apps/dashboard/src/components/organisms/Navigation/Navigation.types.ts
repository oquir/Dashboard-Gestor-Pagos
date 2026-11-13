import type { IconComponent } from 'reicon-react'
import type { Permission } from '../../../lib'

export interface NavigationLink {
  a: string
  text: string
  icon: IconComponent
  permission?: Permission
}

export interface NavigationProps {
  onPick?: () => void
  collapsed?: boolean
  onExpand?: () => void
}
