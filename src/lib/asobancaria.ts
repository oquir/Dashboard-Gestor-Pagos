// Archivo de recaudo en formato Asobancaria 2001: registros de 162 posiciones, uno por línea.
// En la demo los datos son de prueba: las referencias salen de los números de factura y los valores se inventan.
import type { Declaracion } from '../types'
import { descargarBlob } from './archivos'
import { redondearMil } from './reglas'

const LARGO = 162
const NIT = '8999990011'
const BANCO = '007'
const CUENTA = '00000012345678901'
const LOTE = '0001'

/** Campo numérico: justificado a la derecha y con ceros a la izquierda. */
const num = (valor: number | string, largo: number) => String(valor).padStart(largo, '0').slice(-largo)
/** Lo que falta hasta las 162 posiciones (campos reservados) va en blanco. */
const registro = (...campos: string[]) => campos.join('').padEnd(LARGO, ' ')
const azar = (digitos: number) => num(Math.floor(Math.random() * 10 ** digitos), digitos)

interface Recaudo {
  referencia: number
  valor: number
}

function contenido(fecha: string, recaudos: Recaudo[]) {
  const dia = fecha.replaceAll('-', '')
  // Valores en centavos: los dos últimos dígitos son los decimales.
  const total = recaudos.reduce((s, r) => s + r.valor, 0) * 100
  return [
    // 01 Encabezado de archivo: NIT, fecha de recaudo, banco, cuenta, fecha y hora del archivo, modificador, tipo de cuenta.
    registro('01', NIT, dia, BANCO, CUENTA, dia, '1800', 'A', '01'),
    // 05 Encabezado de lote: código del servicio recaudado y número de lote.
    registro('05', num(NIT, 13), LOTE),
    // 06 Detalle: referencia (el número de factura), valor, procedencia, medio de pago, operación, autorización, banco, sucursal y secuencia.
    ...recaudos.map((r, i) => registro('06', num(r.referencia, 48), num(r.valor * 100, 14), '01', '01', azar(6), azar(6), BANCO, '0101', num(i + 1, 7))),
    // 08 Control de lote y 09 control de archivo: cantidad de registros y valor total.
    registro('08', num(recaudos.length, 9), num(total, 18), LOTE),
    registro('09', num(recaudos.length, 9), num(total, 18)),
  ].join('\r\n') + '\r\n'
}

/** Fecha de recaudo (AAAA-MM-DD) del encabezado de archivo, posiciones 13 a 20; undefined si no la trae. */
export function fechaDeRecaudo(texto: string) {
  const encabezado = texto.split(/\r?\n/)[0] ?? ''
  const dia = encabezado.slice(12, 20)
  if (!encabezado.startsWith('01') || !/^\d{8}$/.test(dia)) return undefined
  const fecha = `${dia.slice(0, 4)}-${dia.slice(4, 6)}-${dia.slice(6)}`
  return Number.isNaN(Date.parse(fecha)) ? undefined : fecha
}

/** Descarga el archivo de un solo día, con recaudos de prueba sobre algunas declaraciones. */
export function descargarAsobancaria(fecha: string, declaraciones: Declaracion[]) {
  const recaudos = declaraciones
    .filter((d) => d.totalAPagar > 0)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3 + Math.floor(Math.random() * 8))
    // Uno de cada cuatro, más o menos, es un pago parcial.
    .map((d) => ({ referencia: d.numeroFactura, valor: Math.random() < 0.25 ? redondearMil(d.totalAPagar * 0.5) : d.totalAPagar }))
  const blob = new Blob([contenido(fecha, recaudos)], { type: 'text/plain' })
  descargarBlob(blob, `ASOBANCARIA2001_${fecha.replaceAll('-', '')}.txt`)
}
