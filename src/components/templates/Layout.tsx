import { Xmark } from 'reicon-react'
import { useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useSesion } from '../../lib/sesion'
import { Boton } from '../atoms'
import { Marca } from '../molecules'
import { BarraSuperior, Navegacion } from '../organisms'

/** Estructura de las páginas con sesión: menú lateral (cajón en pantallas angostas), barra superior y contenido. */
export default function Layout() {
  const { usuario } = useSesion()
  const [menuAbierto, setMenuAbierto] = useState(false)

  if (!usuario) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <Marca />
        <Navegacion />
        <p className="border-t border-slate-100 px-5 py-4 text-xs text-slate-400">Demo con datos simulados · sin API</p>
      </aside>

      {menuAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuAbierto(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <Marca />
              <Boton variante="fantasma" aria-label="Cerrar menú" onClick={() => setMenuAbierto(false)}>
                <Xmark className="size-5" />
              </Boton>
            </div>
            <Navegacion alElegir={() => setMenuAbierto(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperior abrirMenu={() => setMenuAbierto(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
