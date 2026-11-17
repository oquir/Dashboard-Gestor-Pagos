import { Component } from 'react'
import type { ReactNode } from 'react'
import type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types'
import { describeError } from './ErrorBoundary.utils'

// Sin esto, un error al pintar desmonta el arbol entero y deja la pantalla en blanco. Tiene que ser
// una clase: React 19 todavia no tiene un hook para capturar errores de render. Solo atrapa lo que
// falla al pintar (y la carga de un React.lazy); un error en un onClick o en un setTimeout no
// llega aca. React ya escribe el error en la consola, asi que no se vuelve a registrar.
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
