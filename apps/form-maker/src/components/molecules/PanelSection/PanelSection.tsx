import { InfoHint } from '../../atoms/InfoHint/InfoHint'
import type { PanelSectionProps } from './PanelSection.types'

export function PanelSection({ title, description, aside, children }: PanelSectionProps) {
  return (
    // En oscuro un velo negro: no hay token entre surface y surface-sunken. En claro border-strong,
    // porque border casi no se ve sobre blanco.
    <section className="flex flex-col gap-3 rounded-lg border border-border-strong bg-surface p-3 dark:border-border dark:bg-black/25">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {aside}
          {description && <InfoHint text={description} label={`Ayuda sobre ${title}`} />}
        </div>
      </div>
      {/* empty:hidden: una seccion sin cuerpo no crece por el gap. */}
      <div className="flex flex-col gap-3 empty:hidden">{children}</div>
    </section>
  )
}
