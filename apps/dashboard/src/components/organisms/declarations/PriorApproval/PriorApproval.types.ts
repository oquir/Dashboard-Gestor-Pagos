import type { ApprovalSituation } from '../../../../lib'
import type { Declaration, TellerMethods } from '../../../../types'

export interface PriorApprovalProps {
  d: Declaration
  situation: ApprovalSituation
  email: string
  canResolve: boolean
  /** Lo que el municipio recibe en su ventanilla para este formulario. */
  teller: TellerMethods
}

/** Una causal del art. 580 del Estatuto Tributario. */
export interface Ground {
  /** Su literal en el artículo. */
  literal: string
  label: string
  /** Lo que le falta a la declaración, como se le explica al contribuyente. */
  description: string
  /** Si se corrige con la sanción reducida del art. 588, parágrafo 2; si no, se presenta de nuevo. */
  isCorrected: boolean
}
