import { NavLink } from 'react-router'
import { puede } from '../../../lib/permisos'
import { ritVisible, useSesion } from '../../../lib/sesion'
import { useDatos } from '../../../store'
import { NAVEGACION } from './constants'
import type { NavegacionProps } from './types'

/** Páginas que el rol puede ver; Inscripciones, solo si el municipio tiene el RIT en el aplicativo. */
export default function Navegacion({ alElegir }: NavegacionProps) {
  const { usuario, municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const enlaces = NAVEGACION.filter(
    (n) => (!n.permiso || puede(usuario?.rol, n.permiso)) && (n.a !== '/rit' || ritVisible(municipios, municipioId)),
  )

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {enlaces.map(({ a, texto, icono: Icono }) => (
        <NavLink
          key={a}
          to={a}
          end={a === '/'}
          onClick={alElegir}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <Icono className="size-4" aria-hidden />
          {texto}
        </NavLink>
      ))}
    </nav>
  )
}
