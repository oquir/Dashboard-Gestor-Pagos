import { Building2, Logout, Menu, RotateLeft } from 'reicon-react'
import { etiquetaRol, nombreCompleto } from '../../../lib/formato'
import { puede } from '../../../lib/permisos'
import { useSesion } from '../../../lib/sesion'
import { useDatos } from '../../../store'
import { Badge, Boton, Select } from '../../atoms'
import type { BarraSuperiorProps } from './types'

/** Municipio que se está viendo (1cero1 lo elige), usuario en sesión y acciones de la demo. */
export default function BarraSuperior({ abrirMenu }: BarraSuperiorProps) {
  const { usuario, municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const seleccionarMunicipio = useDatos((s) => s.seleccionarMunicipio)
  const cerrarSesion = useDatos((s) => s.cerrarSesion)
  const reiniciarDemo = useDatos((s) => s.reiniciarDemo)

  if (!usuario) return null

  const municipio = municipios.find((m) => m.id === municipioId)
  const reiniciar = () => {
    if (window.confirm('¿Reiniciar la demo? Se pierden los cambios hechos y vuelven los datos originales.')) reiniciarDemo()
  }

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
      <Boton variante="fantasma" className="lg:hidden" aria-label="Abrir menú" onClick={abrirMenu}>
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
  )
}
