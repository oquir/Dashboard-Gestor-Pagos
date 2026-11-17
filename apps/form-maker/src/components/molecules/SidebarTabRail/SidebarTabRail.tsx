import { Moon, Sun } from 'reicon-react'
import { Tooltip } from '../../atoms'
import type { SidebarTabRailProps } from './SidebarTabRail.types'

export function SidebarTabRail({
  tabs,
  activeTab,
  onSelect,
  isDarkMode,
  onToggleDarkMode,
  isCollapsed,
}: SidebarTabRailProps) {
  const themeLabel: string = isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'

  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-slate-200 bg-slate-50 py-3 dark:border-neutral-800 dark:bg-neutral-900">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          // Con el panel abierto el encabezado ya nombra la pestana: el globo solo sale contraido.
          <Tooltip key={tab.id} content={tab.label} placement="right" disabled={!isCollapsed}>
            <button
              type="button"
              onClick={() => onSelect(tab.id)}
              aria-label={tab.label}
              className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-brand text-on-brand'
                  : 'text-slate-500 hover:bg-slate-200 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon size={20} />
            </button>
          </Tooltip>
        )
      })}

      <Tooltip content={themeLabel} placement="right" disabled={!isCollapsed}>
        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label={themeLabel}
          className="mt-auto flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 dark:text-neutral-400 dark:hover:bg-neutral-800 hover:cursor-pointer"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </Tooltip>
    </nav>
  )
}
