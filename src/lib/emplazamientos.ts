// Emplazamientos para declarar y para corregir (docs/Pendientes-y-decisiones.md, §3.13).
import type { Declaracion, Emplazamiento, EstadoEmplazamiento, NuevoEmplazamiento, Omiso } from '../types'
import { rangoPeriodo } from './calendario'
import { formatoFecha } from './formato'
import { plazoEnMeses } from './reglas'

type ParaDeclarar = Extract<Emplazamiento, { tipo: 'declarar' }>

/** Lo que da el emplazamiento desde su notificación: 1 mes (arts. 685 y 715 del Estatuto Tributario). */
export const MESES_EMPLAZAMIENTO = 1

/** Último día para declarar o corregir: si cae en fin de semana, el día hábil siguiente (sin festivos). */
export const limiteEmplazamiento = (e: Emplazamiento) => plazoEnMeses(e.fechaNotificacion, MESES_EMPLAZAMIENTO)

export interface SituacionEmplazamiento {
  estado: EstadoEmplazamiento
  limite: string
  /** La declaración o la corrección que lo respondió. */
  respuesta?: Declaracion
}

/** Si la declaración es del inscrito, del formulario y del periodo emplazados: se cruza por fechas, como los omisos. */
function esDelPeriodo(d: Declaracion, e: ParaDeclarar) {
  if (d.tipo === 'correccion' || d.inscripcionId !== e.inscripcionId || d.impuesto !== e.impuesto || d.vigencia !== e.vigencia) return false
  // La rechazada en la aprobación previa se tiene por no presentada (art. 580).
  if (d.aprobacion?.estado === 'rechazada') return false
  const de = rangoPeriodo(d.periodicidad, d.vigencia, d.periodo)
  const emplazado = rangoPeriodo(e.periodicidad, e.vigencia, e.periodo)
  return de.inicio <= emplazado.fin && emplazado.inicio <= de.fin
}

/** La declaración y las que la corrigieron después, una sobre otra. */
function cadena(d: Declaracion, declaraciones: Declaracion[]) {
  const ids = new Set<string>()
  for (let x: Declaracion | undefined = d; x && !ids.has(x.id); x = declaraciones.find((y) => y.id === x!.corrigeA)) ids.add(x.id)
  return ids
}

/**
 * Lo que respondió al emplazamiento: la primera declaración del periodo emplazado, o la primera corrección de la
 * declaración emplazada (o de una corrección suya), presentada desde la notificación.
 */
function respuestaA(e: Emplazamiento, declaraciones: Declaracion[]) {
  const candidatas =
    e.tipo === 'declarar'
      ? declaraciones.filter((d) => esDelPeriodo(d, e))
      : declaraciones.filter((d) => d.tipo === 'correccion' && cadena(d, declaraciones).has(e.declaracionId) && d.id !== e.declaracionId)
  return candidatas
    .filter((d) => d.fechaPresentacion >= e.fechaNotificacion)
    .sort((a, b) => a.fechaPresentacion.localeCompare(b.fechaPresentacion))[0]
}

/**
 * Estado al día de hoy. Si ya llegó la declaración o la corrección, está declarado o corregido, dentro o fuera del mes.
 * Si no, sigue en plazo hasta el límite; después, el de declarar queda vencido (siguen la sanción por no declarar y el
 * aforo) y el de corregir, sin respuesta (no genera sanción, art. 685).
 */
export function situacionEmplazamiento(e: Emplazamiento, declaraciones: Declaracion[], hoy: string): SituacionEmplazamiento {
  const limite = limiteEmplazamiento(e)
  const respuesta = respuestaA(e, declaraciones)
  if (respuesta) return { estado: e.tipo === 'declarar' ? 'declarado' : 'corregido', limite, respuesta }
  if (hoy <= limite) return { estado: 'en_plazo', limite }
  return { estado: e.tipo === 'declarar' ? 'vencido' : 'sin_respuesta', limite }
}

/** Solo se quita mientras nadie lo ha respondido: si no, la sanción de la respuesta quedaría sin explicación. */
export const sePuedeQuitar = (e: Emplazamiento, declaraciones: Declaracion[]) => !respuestaA(e, declaraciones)

/** El emplazamiento para declarar de un omiso. */
export const emplazamientoDelOmiso = (o: Omiso, emplazamientos: Emplazamiento[]) =>
  emplazamientos.find(
    (e): e is ParaDeclarar =>
      e.tipo === 'declarar' &&
      e.inscripcionId === o.inscripcion.id &&
      e.impuesto === o.impuesto &&
      e.vigencia === o.vigencia &&
      e.periodicidad === o.periodicidad &&
      e.periodo === o.periodo,
  )

/** Los emplazamientos para corregir notificados sobre esta declaración. */
export const emplazamientosParaCorregir = (d: Declaracion, emplazamientos: Emplazamiento[]) =>
  emplazamientos.filter((e) => e.tipo === 'corregir' && e.declaracionId === d.id)

/**
 * El emplazamiento que ya estaba notificado cuando se presentó la declaración, y por eso decide su sanción: el de
 * declarar de su periodo, si es inicial (art. 642), o el de corregir de la declaración que corrige o de una anterior, si
 * es una corrección (art. 644, numeral 2).
 */
export function emplazamientoPrevio(d: Declaracion, declaraciones: Declaracion[], emplazamientos: Emplazamiento[]) {
  const anteriores = d.tipo === 'correccion' ? cadena(d, declaraciones) : undefined
  return emplazamientos
    .filter((e) => e.fechaNotificacion <= d.fechaPresentacion)
    .filter((e) => (e.tipo === 'declarar' ? esDelPeriodo(d, e) : anteriores !== undefined && e.declaracionId !== d.id && anteriores.has(e.declaracionId)))
    .sort((a, b) => a.fechaNotificacion.localeCompare(b.fechaNotificacion))[0]
}

/** Qué pasa con el emplazamiento y qué sigue, según su estado. */
export function textoSituacion(e: Emplazamiento, { estado, limite, respuesta }: SituacionEmplazamiento) {
  const hasta = formatoFecha(limite)
  if (respuesta) {
    const cuando = respuesta.fechaPresentacion <= limite ? 'dentro del plazo' : 'después del plazo'
    return estado === 'declarado'
      ? `Declaró el ${formatoFecha(respuesta.fechaPresentacion)}, ${cuando}: la extemporaneidad es la del art. 642.`
      : `Corrigió el ${formatoFecha(respuesta.fechaPresentacion)}, ${cuando}: la sanción por corrección es la del art. 644, numeral 2.`
  }
  if (estado === 'en_plazo') {
    return e.tipo === 'declarar'
      ? `Tiene hasta el ${hasta} para declarar. Desde la notificación, la extemporaneidad es la del art. 642.`
      : `Tiene hasta el ${hasta} para corregir. Toda corrección desde la notificación lleva la sanción del art. 644, numeral 2.`
  }
  return e.tipo === 'declarar'
    ? `Venció el ${hasta} sin declarar: siguen la sanción por no declarar (art. 643) y la liquidación de aforo (art. 717), que expide el municipio en su sistema.`
    : `Venció el ${hasta} sin corrección. No responder no genera sanción (art. 685); si corrige después, igual lleva la sanción del art. 644, numeral 2.`
}

/** Cómo queda un emplazamiento en la bitácora: lo que manda la pantalla; de la copia, el back guarda el nombre. */
export function datosEnviados(e: NuevoEmplazamiento) {
  const comunes = { tipo: e.tipo, municipioId: e.municipioId, numero: e.numero, fechaNotificacion: e.fechaNotificacion, copia: e.copia?.nombre ?? null }
  return e.tipo === 'declarar'
    ? { ...comunes, inscripcionId: e.inscripcionId, impuesto: e.impuesto, vigencia: e.vigencia, periodicidad: e.periodicidad, periodo: e.periodo }
    : { ...comunes, declaracionId: e.declaracionId }
}

/** Otro emplazamiento del municipio ya tiene ese número de acto. */
export const numeroRepetido = (numero: string, municipioId: string, emplazamientos: Emplazamiento[]) =>
  emplazamientos.some((e) => e.municipioId === municipioId && e.numero.trim().toLowerCase() === numero.trim().toLowerCase())
