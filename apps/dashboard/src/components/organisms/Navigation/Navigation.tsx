import { NavLink } from 'react-router'
import { can, ritVisible, useSession } from '../../../lib'
import { useData } from '../../../store'
import { NAVIGATION } from './Navigation.constants'
import type { NavigationProps } from './Navigation.types'

/** Páginas que el rol puede ver; Inscripciones, solo si el municipio tiene el RIT en el aplicativo. */
export default function Navigation({ onPick, collapsed, onExpand  }: NavigationProps) {
  const { user, municipalityId } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const links = NAVIGATION.filter(
    (n) =>
      (!n.permission || can(user?.role, n.permission)) &&
      (n.a !== '/rit' || ritVisible(municipalities, municipalityId)),
  )

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {links.map(({ a, text, icon: IconComponent }) => (
        <NavLink
          key={a}
          to={a}
          end={a === '/'}
          onClick={onPick}
          // Contraído: el primer clic navega y el segundo reabre la barra.
          onDoubleClick={onExpand}
          title={collapsed ? text : undefined}
          aria-label={collapsed ? text : undefined}
          className={({ isActive }) =>
            `flex h-9 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <IconComponent className="size-4 flex-none" aria-hidden />
          {!collapsed && text}
        </NavLink>
      ))}
    </nav>
  )
}
