import type { ReactNode } from 'react'

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap wrap-break-word rounded-md bg-slate-900 px-3 py-2 font-mono text-xs leading-relaxed text-emerald-300 dark:bg-neutral-950">
      <code>{children}</code>
    </pre>
  )
}
