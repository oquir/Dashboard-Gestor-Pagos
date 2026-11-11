import type { Impuesto, Periodicidad } from '../types'

/** Nombre de cada periodo del año según la periodicidad; el periodo 1 va en la posición 0. */
export const NOMBRES_PERIODOS: Record<Periodicidad, string[]> = {
  anual: ['Fecha límite'],
  mensual: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  bimestral: [
    'Bimestre 1 (ene – feb)',
    'Bimestre 2 (mar – abr)',
    'Bimestre 3 (may – jun)',
    'Bimestre 4 (jul – ago)',
    'Bimestre 5 (sep – oct)',
    'Bimestre 6 (nov – dic)',
  ],
  trimestral: ['Trimestre 1 (ene – mar)', 'Trimestre 2 (abr – jun)', 'Trimestre 3 (jul – sep)', 'Trimestre 4 (oct – dic)'],
}

/** Meses que abarca cada periodo según la periodicidad. */
export const MESES_POR_PERIODO: Record<Periodicidad, number> = { anual: 12, trimestral: 3, bimestral: 2, mensual: 1 }

/** Último dígito del NIT o de la cédula, en el orden en que lo listan los calendarios. */
export const DIGITOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

/** Cuando no se sabe qué tiene activo el municipio, se muestran los tres impuestos. */
export const TODOS_ACTIVOS: Record<Impuesto, boolean> = { ica: true, reteica: true, autorretencion: true }
