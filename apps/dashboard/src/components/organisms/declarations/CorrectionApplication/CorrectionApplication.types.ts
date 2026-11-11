import type { CorrectionSituation } from '../../../../lib'
import type { Declaration } from '../../../../types'

export interface CorrectionApplicationProps {
  /** La corrección a la baja que pide el contribuyente. */
  d: Declaration
  /** La declaración que corrige. */
  corrected: Declaration | undefined
  situation: CorrectionSituation
  email: string
  canResolve: boolean
}
