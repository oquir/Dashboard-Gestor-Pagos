import type { SituacionEmplazamiento } from '../../../../lib'
import { formatoFecha } from '../../../../lib'
import type { Emplazamiento } from '../../../../types'

/** En una línea: hasta cuándo tiene, cuándo venció o cuándo respondió. */
export function textoPlazo(
  e: Emplazamiento,
  { estado, limite, respuesta }: SituacionEmplazamiento,
) {
  if (respuesta)
    return `${e.tipo === 'declarar' ? 'Declaró' : 'Corrigió'} el ${formatoFecha(respuesta.fechaPresentacion)}`
  if (estado === 'en_plazo') return `Plazo hasta el ${formatoFecha(limite)}`
  return `Venció el ${formatoFecha(limite)} sin ${e.tipo === 'declarar' ? 'declarar' : 'corregir'}`
}
