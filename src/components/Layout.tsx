import { Building2, ChartSquare, Document, AddressCard, Courthouse, Category, Logout, Menu, RotateLeft, Setting, Users, Wallet, Xmark } from 'reicon-react'
import type { IconComponent } from 'reicon-react'
import { useState } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router'
import { etiquetaRol, nombreCompleto } from '../lib/formato'
import { puede } from '../lib/permisos'
import type { Permiso } from '../lib/permisos'
import { ritVisible, useSesion } from '../lib/sesion'
import { useDatos } from '../store'
import { Badge, Boton, Select } from './ui'

const NAVEGACION: { a: string; texto: string; icono: IconComponent; permiso?: Permiso }[] = [
  { a: '/', texto: 'Inicio', icono: Category },
  { a: '/rit', texto: 'Inscripciones', icono: AddressCard },
  { a: '/declaraciones', texto: 'Declaraciones', icono: Document },
  { a: '/pagos', texto: 'Pagos', icono: Wallet },
  { a: '/reportes', texto: 'Reportes', icono: ChartSquare, permiso: 'verReportes' },
  { a: '/configuracion', texto: 'Configuración', icono: Setting },
  { a: '/usuarios', texto: 'Usuarios', icono: Users, permiso: 'gestionarUsuarios' },
  { a: '/municipios', texto: 'Municipios', icono: Building2, permiso: 'gestionarMunicipios' },
]

export default function Layout() {
  const { usuario, municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const seleccionarMunicipio = useDatos((s) => s.seleccionarMunicipio)
  const cerrarSesion = useDatos((s) => s.cerrarSesion)
  const reiniciarDemo = useDatos((s) => s.reiniciarDemo)
  const [menuAbierto, setMenuAbierto] = useState(false)

  if (!usuario) return <Navigate to="/login" replace />

  const enlaces = NAVEGACION.filter(
    (n) => (!n.permiso || puede(usuario.rol, n.permiso)) && (n.a !== '/rit' || ritVisible(municipios, municipioId)),
  )
  const municipio = municipios.find((m) => m.id === municipioId)

  const reiniciar = () => {
    if (window.confirm('¿Reiniciar la demo? Se pierden los cambios hechos y vuelven los datos originales.')) reiniciarDemo()
  }

  const menu = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {enlaces.map(({ a, texto, icono: Icono }) => (
        <NavLink
          key={a}
          to={a}
          end={a === '/'}
          onClick={() => setMenuAbierto(false)}
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

  const marca = (
    <div className="flex items-center gap-2 px-5 py-5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
        <Courthouse className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">Gestor de Pagos</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        {marca}
        {menu}
        <p className="border-t border-slate-100 px-5 py-4 text-xs text-slate-400">Demo con datos simulados · sin API</p>
      </aside>

      {menuAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuAbierto(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between pr-3">
              {marca}
              <Boton variante="fantasma" aria-label="Cerrar menú" onClick={() => setMenuAbierto(false)}>
                <Xmark className="size-5" />
              </Boton>
            </div>
            {menu}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <Boton variante="fantasma" className="lg:hidden" aria-label="Abrir menú" onClick={() => setMenuAbierto(true)}>
            <Menu className="size-5" />
          </Boton>

          {puede(usuario.rol, 'verTodosLosMunicipios') ? (
            <Select
              aria-label="Municipio"
              className="w-auto min-w-56"
              value={municipioId ?? ''}
              onChange={(e) => seleccionarMunicipio(e.target.value || null)}
            >
              <option value="">Todos los municipios</option>
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.departamento})
                </option>
              ))}
            </Select>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="size-4 text-slate-400" aria-hidden />
              <span className="font-medium text-slate-900">{municipio?.nombre}</span>
              <span className="text-slate-500">· {municipio?.departamento}</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{nombreCompleto(usuario)}</p>
              <p className="text-xs text-slate-500">{usuario.cargo}</p>
            </div>
            <Badge tono={usuario.rol === '1cero1' ? 'info' : 'neutral'}>{etiquetaRol[usuario.rol]}</Badge>
            <Boton variante="fantasma" title="Reiniciar los datos de la demo" onClick={reiniciar}>
              <RotateLeft className="size-4" aria-hidden />
              <span className="hidden xl:inline">Reiniciar demo</span>
            </Boton>
            <Boton variante="fantasma" title="Cambiar de usuario" onClick={cerrarSesion}>
              <Logout className="size-4" aria-hidden />
              <span className="hidden xl:inline">Salir</span>
            </Boton>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
