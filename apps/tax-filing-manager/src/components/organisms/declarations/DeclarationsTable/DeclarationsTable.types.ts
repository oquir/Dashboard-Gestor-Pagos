import type { DeclarationRow } from '../../../../types'

/** Marca o desmarca las declaraciones con esos ids. */
export type MarkAction = (ids: string[], isChecked: boolean) => void

export interface DeclarationsTableProps {
  rows: DeclarationRow[]
  selection: ReadonlySet<string>
  mark: MarkAction
  withApproval: boolean
}
