import type { Impuesto } from '../../../../types'

/** Años hacia atrás que se pueden agregar, para corregir los calendarios pasados que pidan los municipios. */
export const ANIOS_ATRAS = 10

/** Qué vence en cada formulario del año gravable. */
export const DESCRIPCION_FORMULARIO: Record<Impuesto, (vigencia: number) => string> = {
  ica: (vigencia) =>
    `Declaración del año gravable ${vigencia}; se presenta y paga en ${vigencia + 1}.`,
  reteica: (vigencia) => `Lo que los agentes retuvieron en cada periodo de ${vigencia}.`,
  autorretencion: (vigencia) =>
    `Lo que los autorretenedores se practicaron en cada periodo de ${vigencia}.`,
}
