export interface TopBarProps {
  /** Abre el cajón del menú en pantallas angostas. */
  openMenu: () => void
  /** En pantallas anchas: si el menú lateral está contraído, y el botón que lo contrae o lo abre. */
  navCollapsed: boolean
  toggleNav: () => void
}
