import type { Declaration } from '../../../../types'

export interface FiledDeclarationsProps {
  /** De la más reciente a la más antigua. */
  declarations: Declaration[]
  simpleRegime: boolean
}
