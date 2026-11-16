import InfoTip from '../InfoTip'
import type { CardHeaderProps } from './CardHeader.types'

export default function CardHeader({ title, description, actions, info }: CardHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
      <div>
        <h2 className="flex items-center gap-1 text-sm font-semibold text-fg-strong">
          {title}
          {info && <InfoTip label={title} content={info} />}
        </h2>
        {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
