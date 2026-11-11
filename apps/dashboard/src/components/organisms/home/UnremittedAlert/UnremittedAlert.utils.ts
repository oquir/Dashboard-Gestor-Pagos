import type { UnremittedWithholding } from '../../../../types'

/** Lo que falta consignar entre todas. */
export const balanceOf = (withholdings: UnremittedWithholding[]) =>
  withholdings.reduce((sum, r) => sum + r.balance, 0)
