// Archivo de recaudo en formato Asobancaria 2001: registros de 162 posiciones, uno por línea.
// En la demo los datos son de prueba: las referencias salen de los números de factura y los valores se inventan.
import type { Declaration } from '../types'
import { downloadBlob } from './files'
import { roundToThousand } from './rules'

const LENGTH = 162
const NIT = '8999990011'
const BANK = '007'
const ACCOUNT = '00000012345678901'
const BATCH = '0001'

/** Campo numérico: justificado a la derecha y con ceros a la izquierda. */
const num = (value: number | string, length: number) =>
  String(value).padStart(length, '0').slice(-length)
/** Lo que falta hasta las 162 posiciones (campos reservados) va en blanco. */
const entry = (...fields: string[]) => fields.join('').padEnd(LENGTH, ' ')
const random = (digits: number) => num(Math.floor(Math.random() * 10 ** digits), digits)

interface Collection {
  reference: number
  value: number
}

function content(date: string, collections: Collection[]) {
  const day = date.replaceAll('-', '')
  // Valores en centavos: los dos últimos dígitos son los decimales.
  const total = collections.reduce((s, r) => s + r.value, 0) * 100
  return (
    [
      // 01 Encabezado de archivo: NIT, fecha de recaudo, banco, cuenta, fecha y hora del archivo, modificador, tipo de cuenta.
      entry('01', NIT, day, BANK, ACCOUNT, day, '1800', 'A', '01'),
      // 05 Encabezado de lote: código del servicio recaudado y número de lote.
      entry('05', num(NIT, 13), BATCH),
      // 06 Detalle: referencia (el número de factura), valor, procedencia, medio de pago, operación, autorización, banco, sucursal y secuencia.
      ...collections.map((r, i) =>
        entry(
          '06',
          num(r.reference, 48),
          num(r.value * 100, 14),
          '01',
          '01',
          random(6),
          random(6),
          BANK,
          '0101',
          num(i + 1, 7),
        ),
      ),
      // 08 Control de lote y 09 control de archivo: cantidad de registros y valor total.
      entry('08', num(collections.length, 9), num(total, 18), BATCH),
      entry('09', num(collections.length, 9), num(total, 18)),
    ].join('\r\n') + '\r\n'
  )
}

/** Fecha de recaudo (AAAA-MM-DD) del encabezado de archivo, posiciones 13 a 20; undefined si no la trae. */
export function collectionDate(text: string) {
  const heading = text.split(/\r?\n/)[0] ?? ''
  const day = heading.slice(12, 20)
  if (!heading.startsWith('01') || !/^\d{8}$/.test(day)) return undefined
  const date = `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6)}`
  return Number.isNaN(Date.parse(date)) ? undefined : date
}

/** Descarga el archivo de un solo día, con recaudos de prueba sobre algunas declaraciones. */
export function downloadAsobancaria(date: string, declarations: Declaration[]) {
  const collections = declarations
    .filter((d) => d.totalToPay > 0)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3 + Math.floor(Math.random() * 8))
    // Uno de cada cuatro, más o menos, es un pago parcial.
    .map((d) => ({
      reference: d.invoiceNumber,
      value: Math.random() < 0.25 ? roundToThousand(d.totalToPay * 0.5) : d.totalToPay,
    }))
  const blob = new Blob([content(date, collections)], { type: 'text/plain' })
  downloadBlob(blob, `ASOBANCARIA2001_${date.replaceAll('-', '')}.txt`)
}
