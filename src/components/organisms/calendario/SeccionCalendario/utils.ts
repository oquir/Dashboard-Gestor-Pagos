import { ANIO_EN_CURSO } from '../../../../constants'
import type { CalendarioVigencia, Impuesto } from '../../../../types'
import { ANIOS_ATRAS } from './constants'

/** Años que aún no están en el calendario: el siguiente y los pasados, del más reciente al más antiguo. */
export const aniosParaAgregar = (vigencias: number[]) =>
  Array.from({ length: ANIOS_ATRAS + 2 }, (_, i) => ANIO_EN_CURSO + 1 - i).filter((v) => !vigencias.includes(v))

/** El año ya configurado más cercano; ante un empate, el más reciente. */
export const calendarioMasCercano = (calendarios: CalendarioVigencia[], vigencia: number) =>
  [...calendarios].sort((x, y) => Math.abs(x.vigencia - vigencia) - Math.abs(y.vigencia - vigencia) || y.vigencia - x.vigencia)[0] as
    | CalendarioVigencia
    | undefined

/** Mensaje al agregar un año: de dónde salieron sus fechas y qué falta hacer. */
export function textoAgregado(vigencia: number, base: CalendarioVigencia | undefined) {
  if (!base) return `Se agregó el año gravable ${vigencia}. Pon las fechas del calendario oficial del municipio.`
  const anios = Math.abs(vigencia - base.vigencia)
  return `Se agregó el año gravable ${vigencia} con las fechas de ${base.vigencia}, corridas ${anios === 1 ? 'un año' : `${anios} años`}. Cámbialas por las del calendario oficial del municipio y guarda.`
}

/** Errores de un formulario del año, por número de periodo. */
export function erroresDelFormulario(errores: Record<string, string>, vigencia: number, impuesto: Impuesto) {
  const prefijo = `calendario-${vigencia}-${impuesto}-`
  const delFormulario: Record<number, string> = {}
  for (const [clave, error] of Object.entries(errores)) if (clave.startsWith(prefijo)) delFormulario[Number(clave.slice(prefijo.length))] = error
  return delFormulario
}
