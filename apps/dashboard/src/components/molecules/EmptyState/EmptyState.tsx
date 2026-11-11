import type { EmptyStateProps } from './EmptyState.types'

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  )
}
