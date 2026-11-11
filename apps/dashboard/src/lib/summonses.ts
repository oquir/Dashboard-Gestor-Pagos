// Emplazamientos para declarar y para corregir (docs/Pendientes-y-decisiones.md, §3.13).
import type { Declaration, Summons, SummonsStatus, NewSummons, NonFiler } from '../types'
import { periodRange } from './calendar'
import { formatDate } from './format'
import { termInMonths } from './rules'

type ToFile = Extract<Summons, { kind: 'file' }>

/** Lo que da el emplazamiento desde su notificación: 1 mes (arts. 685 y 715 del Estatuto Tributario). */
export const SUMMONS_MONTHS = 1

/** Último día para declarar o corregir: si cae en fin de semana, el día hábil siguiente (sin festivos). */
export const summonsLimit = (e: Summons) => termInMonths(e.notificationDate, SUMMONS_MONTHS)

export interface SummonsSituation {
  status: SummonsStatus
  limit: string
  /** La declaración o la corrección que lo respondió. */
  response?: Declaration
}

/** Si la declaración es del inscrito, del formulario y del periodo emplazados: se cruza por fechas, como los omisos. */
function isOfPeriod(d: Declaration, e: ToFile) {
  if (
    d.kind === 'correction' ||
    d.registrationId !== e.registrationId ||
    d.tax !== e.tax ||
    d.fiscalYear !== e.fiscalYear
  )
    return false
  // La rechazada en la aprobación previa se tiene por no presentada (art. 580).
  if (d.approval?.status === 'rejected') return false
  const declarationRange = periodRange(d.frequency, d.fiscalYear, d.period)
  const summonsRange = periodRange(e.frequency, e.fiscalYear, e.period)
  return declarationRange.start <= summonsRange.end && summonsRange.start <= declarationRange.end
}

/** La declaración y las que la corrigieron después, una sobre otra. */
function chain(d: Declaration, declarations: Declaration[]) {
  const ids = new Set<string>()
  for (
    let x: Declaration | undefined = d;
    x && !ids.has(x.id);
    x = declarations.find((y) => y.id === x!.correctsId)
  )
    ids.add(x.id)
  return ids
}

/**
 * Lo que respondió al emplazamiento: la primera declaración del periodo emplazado, o la primera corrección de la
 * declaración emplazada (o de una corrección suya), presentada desde la notificación.
 */
function replyTo(e: Summons, declarations: Declaration[]) {
  const candidates =
    e.kind === 'file'
      ? declarations.filter((d) => isOfPeriod(d, e))
      : declarations.filter(
          (d) =>
            d.kind === 'correction' &&
            chain(d, declarations).has(e.declarationId) &&
            d.id !== e.declarationId,
        )
  return candidates
    .filter((d) => d.filingDate >= e.notificationDate)
    .sort((a, b) => a.filingDate.localeCompare(b.filingDate))[0]
}

/**
 * Estado al día de hoy. Si ya llegó la declaración o la corrección, está declarado o corregido, dentro o fuera del mes.
 * Si no, sigue en plazo hasta el límite; después, el de declarar queda vencido (siguen la sanción por no declarar y el
 * aforo) y el de corregir, sin respuesta (no genera sanción, art. 685).
 */
export function summonsSituation(
  e: Summons,
  declarations: Declaration[],
  today: string,
): SummonsSituation {
  const limit = summonsLimit(e)
  const response = replyTo(e, declarations)
  if (response) return { status: e.kind === 'file' ? 'declared' : 'corrected', limit, response }
  if (today <= limit) return { status: 'on_time', limit }
  return { status: e.kind === 'file' ? 'overdue' : 'no_reply', limit }
}

/** Solo se quita mientras nadie lo ha respondido: si no, la sanción de la respuesta quedaría sin explicación. */
export const canBeRemoved = (e: Summons, declarations: Declaration[]) => !replyTo(e, declarations)

/** El emplazamiento para declarar de un omiso. */
export const nonFilerSummons = (o: NonFiler, summonses: Summons[]) =>
  summonses.find(
    (e): e is ToFile =>
      e.kind === 'file' &&
      e.registrationId === o.registration.id &&
      e.tax === o.tax &&
      e.fiscalYear === o.fiscalYear &&
      e.frequency === o.frequency &&
      e.period === o.period,
  )

/** Los emplazamientos para corregir notificados sobre esta declaración. */
export const summonsesToCorrect = (d: Declaration, summonses: Summons[]) =>
  summonses.filter((e) => e.kind === 'correct' && e.declarationId === d.id)

/**
 * El emplazamiento que ya estaba notificado cuando se presentó la declaración, y por eso decide su sanción: el de
 * declarar de su periodo, si es inicial (art. 642), o el de corregir de la declaración que corrige o de una anterior, si
 * es una corrección (art. 644, numeral 2).
 */
export function previousSummons(d: Declaration, declarations: Declaration[], summonses: Summons[]) {
  const previousOnes = d.kind === 'correction' ? chain(d, declarations) : undefined
  return summonses
    .filter((e) => e.notificationDate <= d.filingDate)
    .filter((e) =>
      e.kind === 'file'
        ? isOfPeriod(d, e)
        : previousOnes !== undefined &&
          e.declarationId !== d.id &&
          previousOnes.has(e.declarationId),
    )
    .sort((a, b) => a.notificationDate.localeCompare(b.notificationDate))[0]
}

/** Qué pasa con el emplazamiento y qué sigue, según su estado. */
export function situationText(e: Summons, { status, limit, response }: SummonsSituation) {
  const to = formatDate(limit)
  if (response) {
    const when = response.filingDate <= limit ? 'dentro del plazo' : 'después del plazo'
    return status === 'declared'
      ? `Declaró el ${formatDate(response.filingDate)}, ${when}: la extemporaneidad es la del art. 642.`
      : `Corrigió el ${formatDate(response.filingDate)}, ${when}: la sanción por corrección es la del art. 644, numeral 2.`
  }
  if (status === 'on_time') {
    return e.kind === 'file'
      ? `Tiene hasta el ${to} para declarar. Desde la notificación, la extemporaneidad es la del art. 642.`
      : `Tiene hasta el ${to} para corregir. Toda corrección desde la notificación lleva la sanción del art. 644, numeral 2.`
  }
  return e.kind === 'file'
    ? `Venció el ${to} sin declarar: siguen la sanción por no declarar (art. 643) y la liquidación de aforo (art. 717), que expide el municipio en su sistema.`
    : `Venció el ${to} sin corrección. No responder no genera sanción (art. 685); si corrige después, igual lleva la sanción del art. 644, numeral 2.`
}

/** Cómo queda un emplazamiento en la bitácora: lo que manda la pantalla; de la copia, el back guarda el nombre. */
export function sentData(e: NewSummons) {
  const common = {
    kind: e.kind,
    municipalityId: e.municipalityId,
    number: e.number,
    notificationDate: e.notificationDate,
    copy: e.copy?.name ?? null,
  }
  return e.kind === 'file'
    ? {
        ...common,
        registrationId: e.registrationId,
        tax: e.tax,
        fiscalYear: e.fiscalYear,
        frequency: e.frequency,
        period: e.period,
      }
    : { ...common, declarationId: e.declarationId }
}

/** Otro emplazamiento del municipio ya tiene ese número de acto. */
export const repeatedNumber = (number: string, municipalityId: string, summonses: Summons[]) =>
  summonses.some(
    (e) =>
      e.municipalityId === municipalityId &&
      e.number.trim().toLowerCase() === number.trim().toLowerCase(),
  )
