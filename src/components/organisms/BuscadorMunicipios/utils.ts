import { etiquetaFormulario, normalizar } from '../../../lib/formato'
import { formulariosDe } from '../../../lib/sesion'
import type { Municipio } from '../../../types'
import { MAX_RESULTADOS } from './constants'
import type { OpcionMunicipio } from './types'

/** Los municipios cuyo nombre contiene el texto, sin importar tildes ni mayúsculas. Primero los que empiezan por él. */
export function buscarMunicipios(municipios: Municipio[], texto: string) {
  const busqueda = normalizar(texto)
  return municipios
    .map((m) => ({ m, nombre: normalizar(m.nombre) }))
    .filter((x) => x.nombre.includes(busqueda))
    .sort((a, b) => Number(!a.nombre.startsWith(busqueda)) - Number(!b.nombre.startsWith(busqueda)) || a.m.nombre.localeCompare(b.m.nombre, 'es'))
    .map((x) => x.m)
}

/** Lo que muestra la lista para el texto escrito: sin texto, primero la opción de ver todos si va. `mas` son los que no caben. */
export function opcionesMunicipios(municipios: Municipio[], texto: string, conTodos: boolean) {
  const encontrados = buscarMunicipios(municipios, texto)
  const todos: OpcionMunicipio = { id: null, nombre: 'Todos los municipios', detalle: 'Los datos de todos juntos', inactivo: false }
  const opciones = encontrados.slice(0, MAX_RESULTADOS).map<OpcionMunicipio>((m) => ({
    id: m.id,
    nombre: m.nombre,
    detalle: [m.departamento, ...formulariosDe(m).map((f) => etiquetaFormulario[f])].join(' · '),
    inactivo: !m.activo,
  }))
  return { opciones: conTodos && !normalizar(texto) ? [todos, ...opciones] : opciones, mas: Math.max(encontrados.length - MAX_RESULTADOS, 0) }
}
