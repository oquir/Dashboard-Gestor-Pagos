import { Xmark } from 'reicon-react'
import { useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useSession } from '../../lib'
import { Button } from '../atoms'
import { Mark, Toaster } from '../molecules'
import { TopBar, Navigation } from '../organisms'

/** Estructura de las páginas con sesión: menú lateral (cajón en pantallas angostas), barra superior y contenido. */
export default function Layout() {
  const { user } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <Mark />
        <Navigation />
        <p className="border-t border-border-subtle px-5 py-4 text-xs text-fg-subtle">
          Demo con datos simulados · sin API
        </p>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-overlay" onClick={() => setMenuOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-surface shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <Mark />
              <Button variant="ghost" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}>
                <Xmark className="size-5" />
              </Button>
            </div>
            <Navigation onPick={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar openMenu={() => setMenuOpen(true)} />
        <Toaster />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
