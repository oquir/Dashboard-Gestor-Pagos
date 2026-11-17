import { RESET_DEMO_CONFIRMATION } from '../../../constants'
import { useData } from '../../../store'
import { Button, Card } from '../../atoms'
import type { ErrorFallbackProps } from './ErrorFallback.types'

/**
 * Lo que se ve cuando una página o el aplicativo entero falla al pintar. Además de reintentar o recargar, deja
 * reiniciar la demo: si lo guardado en el navegador quedó con una forma que el código ya no espera (un cambio en los
 * datos sin subir la versión del store), recargar vuelve a fallar, y reiniciar es la única salida.
 */
export default function ErrorFallback({
  message,
  onRetry,
  fullScreen = false,
}: ErrorFallbackProps) {
  const resetDemo = useData((s) => s.resetDemo)
  const reset = () => {
    if (!window.confirm(RESET_DEMO_CONFIRMATION)) return
    resetDemo()
    window.location.assign('/')
  }

  return (
    <div
      className={
        fullScreen ? 'flex min-h-screen items-center justify-center bg-surface-sunken p-4' : 'py-6'
      }
    >
      <Card className="mx-auto w-full max-w-lg p-6">
        <div role="alert">
          <h1 className="text-base font-semibold text-fg-strong">Algo salió mal</h1>
          <p className="mt-2 text-sm text-fg-muted">
            {fullScreen ? 'El aplicativo' : 'Esta página'} encontró un error y no se puede mostrar.
            Si vuelve a pasar, reinicia la demo.
          </p>
          <details className="mt-4 text-xs text-fg-muted">
            <summary className="cursor-pointer select-none">Detalle técnico</summary>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-surface-sunken p-3">
              {message}
            </pre>
          </details>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={reset}>
              Reiniciar demo
            </Button>
            {onRetry ? (
              <Button variant="primary" onClick={onRetry}>
                Reintentar
              </Button>
            ) : (
              <Button variant="primary" onClick={() => window.location.reload()}>
                Recargar
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
