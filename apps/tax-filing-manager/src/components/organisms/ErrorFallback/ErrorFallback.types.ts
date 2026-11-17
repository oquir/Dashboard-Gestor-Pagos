export interface ErrorFallbackProps {
  /** El mensaje técnico del error, plegado: le sirve a quien lo vaya a corregir. */
  message: string
  /** Vuelve a pintar lo que falló. Sin él no hay botón "Reintentar": se recarga la página. */
  onRetry?: () => void
  /** Ocupa toda la pantalla, para cuando falló el aplicativo entero y no hay menú. */
  fullScreen?: boolean
}
