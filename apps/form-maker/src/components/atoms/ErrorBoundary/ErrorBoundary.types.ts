import type { ReactNode } from 'react'

export interface ErrorBoundaryProps {
  // Se pinta en lugar de children si el render falla; reset vuelve a intentarlo.
  fallback: (message: string, reset: () => void) => ReactNode
  children: ReactNode
}

export interface ErrorBoundaryState {
  message: string | null
}
