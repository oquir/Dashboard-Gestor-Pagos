// Reglas de la bitácora: qué se considera fuera de horario y cómo se filtra.
import type { RegistroBitacora, Rol, ValorFiltro } from '../types'
import { normalizar } from './formato'

/** Antes de las 7 a. m. o desde las 7 p. m.: lo que el municipio suele preguntar quién hizo. */
export const fueraDeHorario = (r: RegistroBitacora) => {
  const hora = Number(r.fechaHora.slice(11, 13))
  return hora < 7 || hora >= 19
}

/** Los datos enviados en una línea, para buscarlos y para el Excel. */
export const datosEnTexto = (r: RegistroBitacora) => JSON.stringify(r.datos)

export interface FiltrosBitacora {
  texto: string
  controlador: string
  rol: ValorFiltro<Rol>
  soloFueraDeHorario: boolean
  soloFallidas: boolean
}

/** El texto se busca en el número, el usuario, la acción, el endpoint y los datos enviados, sin importar tildes ni mayúsculas. */
export function filtrarBitacora(
  registros: RegistroBitacora[],
  { texto, controlador, rol, soloFueraDeHorario, soloFallidas }: FiltrosBitacora,
) {
  const busqueda = normalizar(texto)
  return registros.filter(
    (r) =>
      (!busqueda ||
        [String(r.id), r.usuario.nombre, r.accion, r.endpoint, datosEnTexto(r)].some((t) =>
          normalizar(t).includes(busqueda),
        )) &&
      (!controlador || r.controlador === controlador) &&
      (!rol || r.usuario.rol === rol) &&
      (!soloFueraDeHorario || fueraDeHorario(r)) &&
      (!soloFallidas || !r.exito),
  )
}

/**
 * El registro de número inmediatamente menor (lo que pasó antes) y el de número inmediatamente mayor, entre los que
 * se recorren. Sirve aunque `id` no esté entre ellos, como un registro de otro municipio abierto con un enlace.
 */
export function vecinos(registros: RegistroBitacora[], id: number) {
  let anterior: RegistroBitacora | undefined
  let siguiente: RegistroBitacora | undefined
  for (const r of registros) {
    if (r.id < id && (!anterior || r.id > anterior.id)) anterior = r
    if (r.id > id && (!siguiente || r.id < siguiente.id)) siguiente = r
  }
  return { anterior, siguiente }
}
