import type { FilterBarProps } from './FilterBar.types'

export default function FilterBar({ searchBox, actions, children }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border-subtle p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-60 flex-1">{searchBox}</div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  )
}
