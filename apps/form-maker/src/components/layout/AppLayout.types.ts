import type { ReactNode } from 'react'

export interface AppLayoutProps {
  sidebar: ReactNode
  canvas: ReactNode
  // Flota sobre el lienzo sin desplazarse ni escalarse: la barra y el chip del panel plegado.
  canvasOverlay?: ReactNode
  rightSidebar: ReactNode
}
