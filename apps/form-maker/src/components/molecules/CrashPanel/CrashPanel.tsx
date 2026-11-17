import type { CrashPanelProps } from './CrashPanel.types'

export function CrashPanel({ title, description, message, children }: CrashPanelProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface-sunken p-6">
      <section
        role="alert"
        className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-sm"
      >
        <h1 className="text-base font-semibold text-fg-strong">{title}</h1>
        <div className="mt-2 text-sm text-fg-muted">{description}</div>
        <details className="mt-4 text-xs text-fg-muted">
          <summary className="cursor-pointer select-none">Detalle técnico</summary>
          <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-surface-sunken p-3 whitespace-pre-wrap break-words">
            {message}
          </pre>
        </details>
        <div className="mt-6 flex flex-wrap justify-end gap-2">{children}</div>
      </section>
    </div>
  )
}
