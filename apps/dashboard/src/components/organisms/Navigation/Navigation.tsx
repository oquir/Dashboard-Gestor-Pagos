import { NavLink } from 'react-router'
import { ArrowUpRight } from 'reicon-react'
import { can, ritVisible, useSession } from '../../../lib'
import { useData } from '../../../store'
import {
  NAVIGATION,
  LINK_BASE_CLASSES,
  LINK_ACTIVE_CLASSES,
  LINK_IDLE_CLASSES,
} from './Navigation.constants'
import type { NavigationProps } from './Navigation.types'

/**
 * Páginas que el rol puede ver; Inscripciones, solo si el municipio tiene el RIT en el aplicativo.
 * Formularios (solo 1cero1) no es una página del dashboard: abre el orquestador en otra pestaña.
 */
export default function Navigation({ onPick }: NavigationProps) {
  const { user, municipalityId } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const links = NAVIGATION.filter(
    (n) =>
      (!n.permission || can(user?.role, n.permission)) &&
      (n.a !== '/rit' || ritVisible(municipalities, municipalityId)),
  )

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {links.map(({ a, text, icon: IconComponent, external }) =>
        external ? (
          <a
            key={a}
            href={a}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onPick}
            className={`${LINK_BASE_CLASSES} ${LINK_IDLE_CLASSES}`}
          >
            <IconComponent className="size-4" aria-hidden />
            {text}
            <ArrowUpRight className="ml-auto size-3.5" aria-hidden />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        ) : (
          <NavLink
            key={a}
            to={a}
            end={a === '/'}
            onClick={onPick}
            className={({ isActive }) =>
              `${LINK_BASE_CLASSES} ${isActive ? LINK_ACTIVE_CLASSES : LINK_IDLE_CLASSES}`
            }
          >
            <IconComponent className="size-4" aria-hidden />
            {text}
          </NavLink>
        ),
      )}
    </nav>
  )
}
