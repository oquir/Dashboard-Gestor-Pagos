import type { Debt } from '../../../../types'

export interface DebtListProps {
  title: string
  description: string
  empty: string
  debts: Debt[]
}
