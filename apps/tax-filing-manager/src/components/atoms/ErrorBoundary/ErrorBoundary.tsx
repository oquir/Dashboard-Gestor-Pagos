import { Component } from 'react'
import type { ReactNode } from 'react'
import type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types'
import { describeError } from './ErrorBoundary.utils'

/**
 * Atrapa los errores al pintar lo que tiene adentro, para que no dejen la pantalla en blanco. Tiene que ser una clase:
 * React 19 todavía no tiene un hook para esto. Solo atrapa lo que falla al pintar; un error en un `onClick` o en un
 * `setTimeout` no llega aquí. React ya escribe el error en la consola.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { message: null }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { message: describeError(error) }
  }

  reset = () => this.setState({ message: null })

  render(): ReactNode {
    if (this.state.message !== null) return this.props.fallback(this.state.message, this.reset)
    return this.props.children
  }
}
