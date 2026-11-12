import { MapPoint2, Logout, Menu, RotateLeft } from 'reicon-react'
import { roleLabel, fullName, can, useSession } from '../../../lib'
import { useData } from '../../../store'
import { Badge, Button } from '../../atoms'
import type { TopBarProps } from './TopBar.types'

/** El municipio del usuario (1cero1 elige el que ve en cada vista), el usuario en sesión y las acciones de la demo. */
export default function TopBar({ openMenu }: TopBarProps) {
  const { user, municipalityId } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const logOut = useData((s) => s.logOut)
  const resetDemo = useData((s) => s.resetDemo)

  if (!user) return null

  const municipality = municipalities.find((m) => m.id === municipalityId)
  const reset = () => {
    if (
      window.confirm(
        '¿Reiniciar la demo? Se pierden los cambios hechos y vuelven los datos originales.',
      )
    )
      resetDemo()
  }

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur sm:px-6">
      <Button variant="ghost" className="lg:hidden" aria-label="Abrir menú" onClick={openMenu}>
        <Menu className="size-5" />
      </Button>

      {!can(user.role, 'canSeeAllMunicipalities') && (
        <div className="flex items-center gap-2 text-sm">
          <MapPoint2 className="size-4 text-fg-subtle" aria-hidden />
          <span className="font-medium text-fg-strong">{municipality?.name}</span>
          <span className="text-fg-muted">· {municipality?.department}</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-fg-strong">{fullName(user)}</p>
          <p className="text-xs text-fg-muted">{user.jobTitle}</p>
        </div>
        <Badge tone={user.role === '1cero1' ? 'info' : 'neutral'}>{roleLabel[user.role]}</Badge>
        <Button variant="ghost" title="Reiniciar los datos de la demo" onClick={reset}>
          <RotateLeft className="size-4" aria-hidden />
          <span className="hidden xl:inline">Reiniciar demo</span>
        </Button>
        <Button variant="ghost" title="Cambiar de usuario" onClick={logOut}>
          <Logout className="size-4" aria-hidden />
          <span className="hidden xl:inline">Salir</span>
        </Button>
      </div>
    </header>
  )
}
