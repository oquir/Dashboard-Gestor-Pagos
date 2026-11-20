import { Component } from 'react'
import type { ReactNode } from 'react'
import type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types'
import { describeError } from './ErrorBoundary.utils'

// Clase porque React 19 no tiene hook para errores de render. No atrapa errores de eventos ni
// timers.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { message: null }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { message: describeError(error) }
  }

  reset = (): void => {
    this.setState({ message: null })
  }

  render(): ReactNode {
    if (this.state.message !== null) return this.props.fallback(this.state.message, this.reset)
    return this.props.children
  }
}
