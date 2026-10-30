// Edición de la configuración del municipio: borrador, validaciones y tramos de pronto pago.
import type { CalendarioVigencia, ConfigMunicipio, TramoProntoPago, VencimientoPeriodo } from '../types'
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

/** Genera un calendario tributario sugerido para una vigencia y periodicidad. */
export function generarCalendarioSugerido(vigencia: number, periodicidad: 'bimestral' | 'mensual'): CalendarioVigencia {
  const vencimientoIca = `${vigencia + 1}-04-20`
  const vencimientosReteica: VencimientoPeriodo[] = []
  if (periodicidad === 'bimestral') {
    const meses = [3, 5, 7, 9, 11]
    meses.forEach((mes, idx) => {
      vencimientosReteica.push({
        periodo: idx + 1,
        fecha: `${vigencia}-${String(mes).padStart(2, '0')}-20`,
      })
    })
    vencimientosReteica.push({
      periodo: 6,
      fecha: `${vigencia + 1}-01-20`,
    })
  } else {
    for (let mes = 1; mes <= 11; mes++) {
      vencimientosReteica.push({
        periodo: mes,
        fecha: `${vigencia}-${String(mes + 1).padStart(2, '0')}-20`,
      })
    }
    vencimientosReteica.push({
      periodo: 12,
      fecha: `${vigencia + 1}-01-20`,
    })
  }

  return {
    vigencia,
    decreto: `Decreto anual de calendario tributario ${vigencia}`,
    vencimientoIca,
    vencimientosReteica,
  }
}

/** Copia el calendario tributario de una vigencia previa corriendo las fechas un año. */
export function copiarCalendarioVigencia(origen: CalendarioVigencia, nuevaVigencia: number): CalendarioVigencia {
  return {
    vigencia: nuevaVigencia,
    decreto: origen.decreto ? origen.decreto.replace(String(origen.vigencia), String(nuevaVigencia)) : undefined,
    vencimientoIca: unAnioDespues(origen.vencimientoIca),
    vencimientosReteica: origen.vencimientosReteica.map((v) => ({
      ...v,
      fecha: unAnioDespues(v.fecha),
    })),
    vencimientosAutorretencion: origen.vencimientosAutorretencion?.map((v) => ({
      ...v,
      fecha: unAnioDespues(v.fecha),
    })),
  }
}

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
  if (b.calendarioTributario?.porVigencia) {
    for (const cal of b.calendarioTributario.porVigencia) {
      if (!cal.vencimientoIca) {
        errores[`calendario-${cal.vigencia}-ica`] = 'Indica la fecha de vencimiento del ICA anual.'
      }
      for (const p of cal.vencimientosReteica ?? []) {
        if (!p.fecha) {
          errores[`calendario-${cal.vigencia}-reteica-${p.periodo}`] = `Indica la fecha del periodo ${p.periodo}.`
        }
      }
      for (const p of cal.vencimientosAutorretencion ?? []) {
        if (!p.fecha) {
          errores[`calendario-${cal.vigencia}-autorretencion-${p.periodo}`] = `Indica la fecha del periodo ${p.periodo}.`
        }
      }
    }
  }
  if (b.aprobacionPrevia.plazoDiasHabiles < 1) errores.plazoAprobacion = 'Debe ser de al menos 1 día hábil.'
  if (b.aprobacionPrevia.vigenciaReciboDiasHabiles < 1) errores.vigenciaRecibo = 'Debe ser de al menos 1 día hábil.'
  for (const [formulario, desactivado] of Object.entries(b.formulariosDesactivados)) {
    if (!desactivado.motivo.trim()) errores[`motivo-${formulario}`] = 'Indica por qué se desactiva el formulario.'
  }
  return errores
}
