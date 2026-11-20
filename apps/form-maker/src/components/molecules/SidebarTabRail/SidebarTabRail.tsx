import { Fragment } from 'react'
import { Moon, Sun } from 'reicon-react'
import { Tooltip } from '../../atoms'
import {
  RAIL_DIVIDER_CLASSES,
  RAIL_TAB_ACTIVE_CLASSES,
  RAIL_TAB_BASE_CLASSES,
  RAIL_TAB_INACTIVE_CLASSES,
} from './SidebarTabRail.constants'
import type { SidebarTabRailProps } from './SidebarTabRail.types'

export function SidebarTabRail({
  tabs,
  dividerBefore = [],
  activeTab,
  onSelect,
  isDarkMode,
  onToggleDarkMode,
}: SidebarTabRailProps) {
  const themeLabel: string = isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'

  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-slate-200 bg-slate-50 py-3 dark:border-neutral-800 dark:bg-neutral-900">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Fragment key={tab.id}>
            {dividerBefore.includes(tab.id) && (
              <span aria-hidden className={RAIL_DIVIDER_CLASSES} />
            )}
            {/* El globo sale siempre: con el panel abierto el encabezado nombra solo la pestana
                activa, y las otras siete quedaban como iconos sin nombre. */}
            <Tooltip content={tab.label} placement="right">
              <button
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-label={tab.label}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={`${RAIL_TAB_BASE_CLASSES} ${
                  activeTab === tab.id ? RAIL_TAB_ACTIVE_CLASSES : RAIL_TAB_INACTIVE_CLASSES
                }`}
              >
                <Icon size={20} />
              </button>
            </Tooltip>
          </Fragment>
        )
      })}

      <Tooltip content={themeLabel} placement="right">
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
