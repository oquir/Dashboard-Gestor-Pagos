import type { Periodicidad } from '../../types/maxDates'

export const ANIOS_POR_DEFECTO: number = 10

// ICA declara el ano anterior (vence al siguiente); retencion el ano en curso, pero esa tabla se
// pega.
export const OFFSET_ICA: number = 1

// Vencimiento mas comun, no una regla: cada municipio lo mueve.
export const MES_DIA_ICA: string = '03/31'

export const PERIODOS_POR_PERIODICIDAD: Record<Periodicidad, number> = {
  anual: 1,
  bimestral: 6,
  trimestral: 4,
  mensual: 12,
}

// Cuando un ano valida por digito hay una fecha por cada uno del 0 al 9.
export const DIGITOS: number = 10
