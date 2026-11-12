import type { EmptyStateProps } from './EmptyState.types'

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm font-medium text-fg">{title}</p>
      {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
    </div>
  )
}
