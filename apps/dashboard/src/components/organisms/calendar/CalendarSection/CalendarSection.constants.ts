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
