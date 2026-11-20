import type { PanelBlockProps } from './PanelBlock.types'

// Bloque plano a todo el ancho (estilo Figma). Convive a proposito con PanelSection, la tarjeta
// para paneles con margen.
export function PanelBlock({ title, action, children }: PanelBlockProps) {
  return (
    <section className="border-b border-border px-3 py-3 last:border-b-0">
      <div className="mb-2 flex min-h-5 items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-fg-strong">{title}</h3>
        {action}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}
