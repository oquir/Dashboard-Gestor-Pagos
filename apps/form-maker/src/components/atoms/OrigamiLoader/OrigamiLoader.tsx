import type { OrigamiLoaderProps } from './OrigamiLoader.types'

// La hoja que se dobla de index.css (.origami-loader). Es la unica animacion que el modo de bajo
// rendimiento deja viva: un loader quieto parece colgado.
export function OrigamiLoader({ label }: OrigamiLoaderProps) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-6">
      <div aria-hidden className="origami-loader">
        <span className="origami-loader__tile" />
        <span className="origami-loader__tile" />
        <span className="origami-loader__tile" />
        <span className="origami-loader__tile" />
      </div>
      {label ? (
        <p className="text-sm text-fg-muted">{label}</p>
      ) : (
        <span className="sr-only">Cargando</span>
      )}
    </div>
  )
}
