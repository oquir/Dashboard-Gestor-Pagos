import { Xmark } from 'reicon-react'
import { useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useSession } from '../../lib'
import { Button } from '../atoms'
import { Mark } from '../molecules'
import { TopBar, Navigation } from '../organisms'

const COLLAPSED_KEY = 'gestor-pagos:nav-collapsed'

/** Estructura de las páginas con sesión: menú lateral (cajón en pantallas angostas), barra superior y contenido. */
export default function Layout() {
  const { user } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === '1')
  const collapse = () => {
    setCollapsed(true)
    localStorage.setItem(COLLAPSED_KEY, '1')
  }
  const expand = () => {
    setCollapsed(false)
    localStorage.setItem(COLLAPSED_KEY, '0')
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen lg:flex">
      {/* El ancho se anima; overflow-hidden y whitespace-nowrap evitan que el texto salte de línea mientras cambia.
          Va fijo a la altura de la pantalla (sticky) para que no se vaya con el scroll de la página. */}
      <aside
        className={`hidden shrink-0 flex-col overflow-hidden whitespace-nowrap border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start ${
          collapsed ? 'w-17' : 'w-64'
        }`}
      >
        <Mark collapsed={collapsed} />
        <Navigation collapsed={collapsed} onExpand={expand} />
        {!collapsed && (
          <p className="border-t border-slate-100 px-5 py-4 text-[13px] text-slate-400">
            Demo con datos simulados · sin API
          </p>
        )}
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <Mark
              action={
                <Button variant="ghost" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}>
                  <Xmark className="size-5" />
                </Button>
              }
            />
            <Navigation onPick={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          openMenu={() => setMenuOpen(true)}
          navCollapsed={collapsed}
          toggleNav={collapsed ? expand : collapse}
        />
        <main
          className={`mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8 ${
            collapsed ? 'lg:w-[calc(100%-11.75rem)]' : ''
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
