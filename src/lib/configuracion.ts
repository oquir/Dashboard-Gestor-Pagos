// Edición de la configuración del municipio: borrador, validaciones y tramos de pronto pago.
import type { ConfigMunicipio, TramoProntoPago } from '../types'
import { formatoFecha } from './formato'
import { ANTICIPO_MAXIMO, SANCIONES_LEY } from './reglas'

/** Valor de un campo numérico; vacío cuenta como 0. */
export const numero = (v: string) => (v === '' ? 0 : Number(v))

const diaSiguiente = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}
const finDeMes = (iso: string) => new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), 0)).toISOString().slice(0, 10)
/** La misma fecha un año después; el 29 de febrero pasa al 28. */
export const unAnioDespues = (iso: string) => iso && `${Number(iso.slice(0, 4)) + 1}${iso.slice(4)}`.replace(/-02-29$/, '-02-28')

/** Un tramo nuevo arranca el día siguiente al último y llega hasta fin de ese mes. */
export function tramoNuevo(vigencia: number, tramos: TramoProntoPago[]): TramoProntoPago {
  const ultimo = tramos.map((t) => t.hasta).filter(Boolean).sort().at(-1)
  const desde = ultimo ? diaSiguiente(ultimo) : `${vigencia + 1}-01-01`
  return { desde, hasta: finDeMes(desde), porcentaje: tramos.at(-1)?.porcentaje ?? 10 }
}

function erroresTramos(vigencia: number, tramos: TramoProntoPago[]) {
  return tramos.map((t, i) => {
    if (!t.desde || !t.hasta) return 'Completa las dos fechas.'
    if (t.desde > t.hasta) return 'La fecha final es anterior a la inicial.'
    if (t.desde <= `${vigencia}-12-31`) return `El año gravable ${vigencia} se declara y paga desde ${vigencia + 1}.`
    if (t.porcentaje <= 0 || t.porcentaje > 100) return 'El descuento debe ser mayor que 0 y máximo 100 %.'
    const cruce = tramos.find((o, j) => j !== i && o.desde && o.hasta && o.desde <= t.hasta && t.desde <= o.hasta)
    return cruce && `Se cruza con el tramo del ${formatoFecha(cruce.desde)} al ${formatoFecha(cruce.hasta)}.`
  })
}

/** Errores del borrador por campo; sin errores, se puede guardar. */
export function erroresConfiguracion(b: ConfigMunicipio) {
  const errores: Record<string, string> = {}
  for (const clave of Object.keys(SANCIONES_LEY) as (keyof ConfigMunicipio['sanciones'])[]) {
    if (b.sanciones[clave] > SANCIONES_LEY[clave]) errores[clave] = `La ley fija como máximo ${SANCIONES_LEY[clave]}; el municipio solo puede bajarla.`
    if (b.sanciones[clave] < 0) errores[clave] = 'No puede ser negativa.'
  }
  if (b.anticipoPorcentaje > ANTICIPO_MAXIMO) errores.anticipo = `Máximo ${ANTICIPO_MAXIMO}% (art. 47 de la Ley 43 de 1987).`
  if (b.sobretasaBomberil.activa && b.sobretasaBomberil.porcentaje <= 0) errores.sobretasa = 'Debe ser mayor que 0; si no se cobra, desactívala.'
  if (b.prontoPago.activo) {
    for (const { vigencia, tramos } of b.prontoPago.porVigencia) {
      erroresTramos(vigencia, tramos).forEach((error, i) => {
        if (error) errores[`pronto-${vigencia}-${i}`] = error
      })
    }
  }
  if (b.aprobacionPrevia.plazoDiasHabiles < 1) errores.plazoAprobacion = 'Debe ser de al menos 1 día hábil.'
  if (b.aprobacionPrevia.vigenciaReciboDiasHabiles < 1) errores.vigenciaRecibo = 'Debe ser de al menos 1 día hábil.'
  return errores
}
