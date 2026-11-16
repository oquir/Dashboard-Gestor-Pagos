import { NavLink } from 'react-router'
import { can, ritVisible, useSession } from '../../../lib'
import { useData } from '../../../store'
import { Tooltip } from '../../molecules'
import { NAVIGATION } from './Navigation.constants'
import type { NavigationProps } from './Navigation.types'

/** Páginas que el rol puede ver; Inscripciones, solo si el municipio tiene el RIT en el aplicativo. */
export default function Navigation({ onPick, collapsed, onExpand }: NavigationProps) {
  const { user, municipalityId } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const links = NAVIGATION.filter(
    (n) =>
      (!n.permission || can(user?.role, n.permission)) &&
      (n.a !== '/rit' || ritVisible(municipalities, municipalityId)),
  )

  return (
    // min-h-0 y overflow-y-auto: si la pantalla es baja, las opciones se desplazan dentro del menú en vez de cortarse.
    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
      {links.map(({ a, text, icon: IconComponent }) => (
        <Tooltip key={a} content={text} placement="right">
          <NavLink
            to={a}
            end={a === '/'}
            onClick={(e) => {
              // Contraído: un clic en la página en la que ya está reabre la barra; en las demás, solo navega.
              if (collapsed && e.currentTarget.getAttribute('aria-current') === 'page') onExpand?.()
              onPick?.()
            }}
            aria-label={collapsed ? text : undefined}
            className={({ isActive }) =>
              `flex h-10 items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-medium transition-colors ${
                isActive
                  ? 'bg-brand-surface text-brand-fg'
                  : 'text-fg-soft hover:bg-surface-raised hover:text-fg-strong'
              }`
            }
          >
            <IconComponent className="size-5 flex-none" aria-hidden />
            {!collapsed && text}
          </NavLink>
        </Tooltip>
      ))}
    </nav>
  )
}
