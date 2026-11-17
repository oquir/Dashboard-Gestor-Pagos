import type { ReactNode } from 'react'

export interface ErrorBoundaryProps {
  // Lo que se pinta en lugar de children cuando algo debajo falla al renderizar. reset vuelve a
  // intentar pintar children desde cero.
  fallback: (message: string, reset: () => void) => ReactNode
  children: ReactNode
}

export interface ErrorBoundaryState {
  message: string | null
}
