import type { Tax } from '../../../../types'

/** Años hacia atrás que se pueden agregar, para corregir los calendarios pasados que pidan los municipios. */
export const YEARS_BACK = 10

/** Qué vence en cada formulario del año gravable. */
export const FORM_DESCRIPTION: Record<Tax, (fiscalYear: number) => string> = {
  ica: (fiscalYear) =>
    `Declaración del año gravable ${fiscalYear}; se presenta y paga en ${fiscalYear + 1}.`,
  reteica: (fiscalYear) => `Lo que los agentes retuvieron en cada periodo de ${fiscalYear}.`,
  selfWithholding: (fiscalYear) =>
    `Lo que los autorretenedores se practicaron en cada periodo de ${fiscalYear}.`,
}

/** Globo de "Acto que fija el calendario". */
export const DECREE_INFO =
  'El decreto o la resolución con que el municipio publica las fechas límite de ese año gravable. Queda como referencia de dónde salen las fechas.'
