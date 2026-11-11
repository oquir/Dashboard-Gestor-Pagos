import { ANIO_EN_CURSO } from '../../../../constants'
import { etiquetaImpuesto, etiquetaPeriodicidad, formatoLista } from '../../../../lib/formato'
import type { CalendarioVigencia, Declaracion, Impuesto, Periodicidad } from '../../../../types'
import { ANIOS_ATRAS } from './SeccionCalendario.constants'

/**
 * Aviso cuando el calendario del año ya no tiene la periodicidad con que se presentaron sus declaraciones: ellas
 * conservan su periodo, así que el calendario deja de coincidir con lo declarado. Sin declaraciones así, undefined.
 */
export function textoOtraPeriodicidad(
  declaraciones: Declaracion[],
  municipioId: string,
  impuesto: Impuesto,
  vigencia: number,
  periodicidad: Periodicidad,
) {
  const otras = declaraciones.filter(
    (d) =>
      d.municipioId === municipioId &&
      d.impuesto === impuesto &&
      d.vigencia === vigencia &&
      d.periodicidad !== periodicidad,
  )
  if (otras.length === 0) return undefined
  const cuales = formatoLista([
    ...new Set(otras.map((d) => etiquetaPeriodicidad[d.periodicidad].toLowerCase())),
  ])
  const cuantas = otras.length === 1 ? 'una declaración' : `${otras.length} declaraciones`
  return (
    `Ya hay ${cuantas} de ${etiquetaImpuesto[impuesto]} de ${vigencia} ${otras.length === 1 ? 'presentada' : 'presentadas'} con periodicidad ${cuales}. ` +
    `${otras.length === 1 ? 'Conserva su periodo' : 'Conservan su periodo'} aunque la cambies aquí, así que el calendario dejará de coincidir con lo que ya se declaró.`
  )
}

/** Años que aún no están en el calendario: el siguiente y los pasados, del más reciente al más antiguo. */
export const aniosParaAgregar = (vigencias: number[]) =>
  Array.from({ length: ANIOS_ATRAS + 2 }, (_, i) => ANIO_EN_CURSO + 1 - i).filter(
    (v) => !vigencias.includes(v),
  )

/** El año ya configurado más cercano; ante un empate, el más reciente. */
export const calendarioMasCercano = (calendarios: CalendarioVigencia[], vigencia: number) =>
  [...calendarios].sort(
    (x, y) =>
      Math.abs(x.vigencia - vigencia) - Math.abs(y.vigencia - vigencia) || y.vigencia - x.vigencia,
  )[0] as CalendarioVigencia | undefined

/** Mensaje al agregar un año: de dónde salieron sus fechas y qué falta hacer. */
export function textoAgregado(vigencia: number, base: CalendarioVigencia | undefined) {
  if (!base)
    return `Se agregó el año gravable ${vigencia}. Pon las fechas del calendario oficial del municipio.`
  const anios = Math.abs(vigencia - base.vigencia)
  return `Se agregó el año gravable ${vigencia} con las fechas de ${base.vigencia}, corridas ${anios === 1 ? 'un año' : `${anios} años`}. Cámbialas por las del calendario oficial del municipio y guarda.`
}

/** Errores de un formulario del año, por número de periodo. */
export function erroresDelFormulario(
  errores: Record<string, string>,
  vigencia: number,
  impuesto: Impuesto,
) {
  const prefijo = `calendario-${vigencia}-${impuesto}-`
  const delFormulario: Record<number, string> = {}
  for (const [clave, error] of Object.entries(errores))
    if (clave.startsWith(prefijo)) delFormulario[Number(clave.slice(prefijo.length))] = error
  return delFormulario
}
