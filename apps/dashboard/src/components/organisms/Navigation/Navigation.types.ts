import type { IconComponent } from 'reicon-react'
import type { Permission } from '../../../lib'

export interface NavigationLink {
  a: string
  text: string
  icon: IconComponent
  permission?: Permission
  /** `a` es una dirección de otra app: se abre en una pestaña nueva en vez de navegar dentro del dashboard. */
  external?: boolean
}

export interface NavigationProps {
  onPick?: () => void
}
