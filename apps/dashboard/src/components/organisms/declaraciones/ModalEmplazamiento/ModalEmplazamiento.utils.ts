import { numeroRepetido } from '../../../../lib'
import { formatoFecha } from '../../../../lib'
import type { Emplazamiento } from '../../../../types'
import type { Destinatario } from './ModalEmplazamiento.types'

/** La fecha de notificación: obligatoria, no futura y no anterior al vencimiento o a la presentación más reciente. */
export function errorFecha(
  fecha: string,
  hoy: string,
  destinatarios: Destinatario[],
  tipo: Emplazamiento['tipo'],
) {
  const minimo = destinatarios.reduce((m, x) => (x.desde > m ? x.desde : m), '')
  if (!fecha) return 'Elige la fecha de notificación.'
  if (fecha > hoy) return 'No puede ser una fecha futura: se registra lo que ya se notificó.'
  if (fecha < minimo) {
    const cual =
      tipo === 'declarar'
        ? destinatarios.length > 1
          ? 'el vencimiento más reciente de los periodos elegidos'
          : 'el vencimiento del periodo'
        : 'la presentación de la declaración'
    return `No puede ser anterior al ${formatoFecha(minimo)}, ${cual}.`
  }
  return undefined
}

/** El número del acto: obligatorio y sin repetirse en la lista ni en los emplazamientos del municipio. */
export function errorNumero(
  clave: string,
  numeros: Record<string, string>,
  destinatarios: Destinatario[],
  existentes: Emplazamiento[],
) {
  const numero = (numeros[clave] ?? '').trim()
  if (!numero) return 'Escribe el número del acto.'
  const igual = (otro: string | undefined) =>
    (otro ?? '').trim().toLowerCase() === numero.toLowerCase()
  if (destinatarios.some((x) => x.clave !== clave && igual(numeros[x.clave])))
    return 'Otro emplazamiento de la lista tiene este número.'
  const municipioId = destinatarios.find((x) => x.clave === clave)?.destino.municipioId ?? ''
  if (numeroRepetido(numero, municipioId, existentes))
    return 'Ya hay un emplazamiento del municipio con este número.'
  return undefined
}
