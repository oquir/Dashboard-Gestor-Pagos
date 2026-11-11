// Reglas de la bitácora: qué se considera fuera de horario y cómo se filtra.
import type { AuditLogEntry, Role, FilterValue } from '../types'
import { normalize } from './format'

/** Antes de las 7 a. m. o desde las 7 p. m.: lo que el municipio suele preguntar quién hizo. */
export const afterHours = (r: AuditLogEntry) => {
  const time = Number(r.dateTime.slice(11, 13))
  return time < 7 || time >= 19
}

/** Los datos enviados en una línea, para buscarlos y para el Excel. */
export const dataAsText = (r: AuditLogEntry) => JSON.stringify(r.data)

export interface AuditLogFilters {
  text: string
  controller: string
  role: FilterValue<Role>
  afterHoursOnly: boolean
  failedOnly: boolean
}

/** El texto se busca en el número, el usuario, la acción, el endpoint y los datos enviados, sin importar tildes ni mayúsculas. */
export function filterAuditLog(
  entries: AuditLogEntry[],
  { text, controller, role, afterHoursOnly, failedOnly }: AuditLogFilters,
) {
  const query = normalize(text)
  return entries.filter(
    (r) =>
      (!query ||
        [String(r.id), r.user.name, r.action, r.endpoint, dataAsText(r)].some((t) =>
          normalize(t).includes(query),
        )) &&
      (!controller || r.controller === controller) &&
      (!role || r.user.role === role) &&
      (!afterHoursOnly || afterHours(r)) &&
      (!failedOnly || !r.success),
  )
}

/**
 * El registro de número inmediatamente menor (lo que pasó antes) y el de número inmediatamente mayor, entre los que
 * se recorren. Sirve aunque `id` no esté entre ellos, como un registro de otro municipio abierto con un enlace.
 */
export function neighbors(entries: AuditLogEntry[], id: number) {
  let previous: AuditLogEntry | undefined
  let nextOne: AuditLogEntry | undefined
  for (const r of entries) {
    if (r.id < id && (!previous || r.id > previous.id)) previous = r
    if (r.id > id && (!nextOne || r.id < nextOne.id)) nextOne = r
  }
  return { previous, nextOne }
}
