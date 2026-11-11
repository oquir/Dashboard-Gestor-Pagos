import type { RetencionSinConsignar } from '../../../../types'

/** Lo que falta consignar entre todas. */
export const saldoDe = (retenciones: RetencionSinConsignar[]) => retenciones.reduce((suma, r) => suma + r.saldo, 0)
