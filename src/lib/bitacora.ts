// Reglas de la bitácora: qué se considera fuera de horario y cómo se filtra.
import type { CategoriaBitacora, RegistroBitacora, Rol, ValorFiltro } from '../types'
import { normalizar } from './formato'

/** Antes de las 7 a. m. o desde las 7 p. m.: lo que el municipio suele preguntar quién hizo. */
export const fueraDeHorario = (r: RegistroBitacora) => {
  const hora = Number(r.fechaHora.slice(11, 13))
  return hora < 7 || hora >= 19
}

export interface FiltrosBitacora {
  texto: string
  categoria: ValorFiltro<CategoriaBitacora>
  rol: ValorFiltro<Rol>
  soloFueraDeHorario: boolean
}

/** El texto se busca en el usuario, la acción y los valores de antes y después, sin importar tildes ni mayúsculas. */
export function filtrarBitacora(registros: RegistroBitacora[], { texto, categoria, rol, soloFueraDeHorario }: FiltrosBitacora) {
  const busqueda = normalizar(texto)
  return registros.filter(
    (r) =>
      (!busqueda || [r.usuario.nombre, r.accion, r.antes ?? '', r.despues ?? ''].some((t) => normalizar(t).includes(busqueda))) &&
      (!categoria || r.categoria === categoria) &&
      (!rol || r.usuario.rol === rol) &&
      (!soloFueraDeHorario || fueraDeHorario(r)),
  )
}
