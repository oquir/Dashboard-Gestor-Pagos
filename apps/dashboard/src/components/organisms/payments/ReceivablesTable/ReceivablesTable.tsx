import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Table from '../../Table'
import { COLUMNS, INITIAL_ORDER } from './ReceivablesTable.constants'
import type { ReceivablesTableProps } from './ReceivablesTable.types'

/** Declaraciones vigentes con saldo por pagar, de la mayor deuda a la menor. */
export default function ReceivablesTable({ receivables }: ReceivablesTableProps) {
  return (
    <Card>
      <CardHeader
        title="Cartera pendiente"
        description="Declaraciones vigentes con saldo por pagar."
      />
      <Table
        data={receivables}
        columns={COLUMNS}
        perPage={10}
        initialOrder={INITIAL_ORDER}
        rowId={(f) => f.d.id}
        name="declaraciones con saldo"
        empty="No hay cartera pendiente"
      />
    </Card>
  )
}
