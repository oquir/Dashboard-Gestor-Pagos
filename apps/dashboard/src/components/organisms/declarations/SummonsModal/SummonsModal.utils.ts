import { repeatedNumber, formatDate } from '../../../../lib'
import type { Summons } from '../../../../types'
import type { Recipient } from './SummonsModal.types'

/** La fecha de notificación: obligatoria, no futura y no anterior al vencimiento o a la presentación más reciente. */
export function dateError(
  date: string,
  today: string,
  recipients: Recipient[],
  kind: Summons['kind'],
) {
  const minimumValue = recipients.reduce((m, x) => (x.from > m ? x.from : m), '')
  if (!date) return 'Elige la fecha de notificación.'
  if (date > today) return 'No puede ser una fecha futura: se registra lo que ya se notificó.'
  if (date < minimumValue) {
    const which =
      kind === 'file'
        ? recipients.length > 1
          ? 'el vencimiento más reciente de los periodos elegidos'
          : 'el vencimiento del periodo'
        : 'la presentación de la declaración'
    return `No puede ser anterior al ${formatDate(minimumValue)}, ${which}.`
  }
  return undefined
}

/** El número del acto: obligatorio y sin repetirse en la lista ni en los emplazamientos del municipio. */
export function numberError(
  key: string,
  numbers: Record<string, string>,
  recipients: Recipient[],
  existing: Summons[],
) {
  const number = (numbers[key] ?? '').trim()
  if (!number) return 'Escribe el número del acto.'
  const equal = (other: string | undefined) =>
    (other ?? '').trim().toLowerCase() === number.toLowerCase()
  if (recipients.some((x) => x.key !== key && equal(numbers[x.key])))
    return 'Otro emplazamiento de la lista tiene este número.'
  const municipalityId = recipients.find((x) => x.key === key)?.destination.municipalityId ?? ''
  if (repeatedNumber(number, municipalityId, existing))
    return 'Ya hay un emplazamiento del municipio con este número.'
  return undefined
}
