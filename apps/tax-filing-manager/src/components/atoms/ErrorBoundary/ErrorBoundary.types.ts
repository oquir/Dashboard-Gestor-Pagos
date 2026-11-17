import type { ReactNode } from 'react'

export interface ErrorBoundaryProps {
  /** Lo que se pinta en lugar de `children` si algo debajo falla al pintar. `reset` vuelve a intentarlo desde cero. */
  fallback: (message: string, reset: () => void) => ReactNode
  children: ReactNode
}

export interface ErrorBoundaryState {
  /** El mensaje del error atrapado; null mientras todo va bien. */
  message: string | null
}
