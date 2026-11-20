import type {
  DeclaracionKind,
  FechasMaximasPresentacion,
  Periodicidad,
  ReglaAnio,
  TipoDigitoValidacion,
} from '../../types'
import {
  ANIOS_POR_DEFECTO,
  DIGITOS,
  MES_DIA_ICA,
  OFFSET_ICA,
  PERIODOS_POR_PERIODICIDAD,
} from './maxDates.constants'

// Fechas maximas de presentacion: periodos por ano, tabla por defecto y busqueda. Puro.

const UN_DIGITO: RegExp = /^[0-9]$/

const FECHA_TEXTO: RegExp = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/

const MS_POR_DIA: number = 86400000

// A UTC a mano: Date lee "AAAA/MM/DD" como local y "AAAA-MM-DD" como UTC, y un dia de diferencia es
// una sancion.
export function aUtc(fecha: string): number | null {
  const match: RegExpMatchArray | null = fecha.trim().match(FECHA_TEXTO)
  if (!match) return null

  const anio: number = Number(match[1])
  const mes: number = Number(match[2])
  const dia: number = Number(match[3])
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null

  const ms: number = Date.UTC(anio, mes - 1, dia)

  // Date.UTC corre el 31 de febrero al 3 de marzo: se compara la vuelta.
  const vuelta = new Date(ms)

  return vuelta.getUTCMonth() === mes - 1 && vuelta.getUTCDate() === dia ? ms : null
}

// Dias completos de `desde` a `hasta`. Positivo si `hasta` es posterior.
export function diasEntre(desde: string, hasta: string): number | null {
  const a: number | null = aUtc(desde)
  const b: number | null = aUtc(hasta)
  if (a === null || b === null) return null

  return Math.round((b - a) / MS_POR_DIA)
}

// Mes o fraccion, como cuenta la sancion: un dia tarde es un mes. Por calendario y no dividiendo
// por 30, que cobraria un mes de mas.
export function mesesOFraccion(desde: string, hasta: string): number | null {
  const a: number | null = aUtc(desde)
  const b: number | null = aUtc(hasta)
  if (a === null || b === null) return null

  // Presentar el mismo dia del limite no es tarde.
  if (b <= a) return 0

  const inicio = new Date(a)
  const fin = new Date(b)
  const completos: number =
    (fin.getUTCFullYear() - inicio.getUTCFullYear()) * 12 +
    (fin.getUTCMonth() - inicio.getUTCMonth())

  return fin.getUTCDate() > inicio.getUTCDate() ? completos + 1 : completos
}

// Recibe la fecha para poder probarlo sin tocar el reloj.
export function enTexto(fecha: Date): string {
  const mes: string = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia: string = String(fecha.getDate()).padStart(2, '0')

  return `${fecha.getFullYear()}/${mes}/${dia}`
}

export function periodosDe(periodicidad: Periodicidad): number {
  return PERIODOS_POR_PERIODICIDAD[periodicidad]
}

// Para ver de un vistazo que un volcado llego incompleto.
export function fechasEsperadas(regla: ReglaAnio): number {
  return periodosDe(regla.periodicidad) * (regla.tipoDigito === 'ninguno' ? 1 : DIGITOS)
}

// null y no un numero: Number("") da 0 (elegiria el digito 0) y una letra da NaN.
export function digitoDe(
  documento: string,
  tipo: Exclude<TipoDigitoValidacion, 'ninguno'>,
): number | null {
  const limpio: string = documento.trim()
  if (limpio.length === 0) return null

  const char: string = tipo === 'primer_digito' ? limpio[0] : limpio[limpio.length - 1]

  return UN_DIGITO.test(char) ? Number(char) : null
}

export function buscarFechaLimite(
  reglas: ReglaAnio[],
  anio: number,
  periodo: number,
  documento: string,
): string | undefined {
  const regla: ReglaAnio | undefined = reglas.find((r) => r.anio === anio)
  if (!regla) return undefined

  if (regla.tipoDigito === 'ninguno') {
    return regla.fechas.find((f) => f.periodo === periodo)?.fecha
  }

  const digito: number | null = digitoDe(documento, regla.tipoDigito)
  if (digito === null) return undefined

  return regla.fechas.find((f) => f.periodo === periodo && f.digito === digito)?.fecha
}

// Los anos gravables mas recientes, uno por ano. Con offset 1 y 2026 salen 2016-2025, el ultimo
// venciendo en 2026.
export function generarReglasAnuales(
  anioActual: number,
  cantidad: number,
  offset: number,
  mesDia: string,
): ReglaAnio[] {
  const reglas: ReglaAnio[] = []
  const ultimo: number = anioActual - offset

  for (let anio = ultimo - cantidad + 1; anio <= ultimo; anio += 1) {
    reglas.push({
      anio,
      periodicidad: 'anual',
      tipoDigito: 'ninguno',
      fechas: [{ periodo: 1, fecha: `${anio + offset}/${mesDia}` }],
    })
  }

  return reglas
}

// Solo el periodo 1 de los anos sin digito: lo unico que el panel deja editar a mano.
export function conFechaAnual(
  fechas: FechasMaximasPresentacion,
  kind: DeclaracionKind,
  anio: number,
  nueva: string,
): FechasMaximasPresentacion {
  return {
    ...fechas,
    [kind]: fechas[kind].map((regla) =>
      regla.anio === anio && regla.periodicidad === 'anual' && regla.tipoDigito === 'ninguno'
        ? { ...regla, fechas: [{ periodo: 1, fecha: nueva }] }
        : regla,
    ),
  }
}

// Retencion y autorretencion vacias a proposito: generarlas inventaria datos. Se cargan pegando el
// volcado.
export function generarFechasPorDefecto(anioActual: number): FechasMaximasPresentacion {
  return {
    municipioId: '',
    ica: generarReglasAnuales(anioActual, ANIOS_POR_DEFECTO, OFFSET_ICA, MES_DIA_ICA),
    reteica: [],
    autoretencionIca: [],
  }
}
