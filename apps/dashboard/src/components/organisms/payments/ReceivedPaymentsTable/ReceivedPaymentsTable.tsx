import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Table from '../../Table'
import { COLUMNS, INITIAL_ORDER } from './ReceivedPaymentsTable.constants'
import type { ReceivedPaymentsTableProps } from './ReceivedPaymentsTable.types'

/** Pagos recibidos, del más reciente al más antiguo. */
export default function ReceivedPaymentsTable({ payments }: ReceivedPaymentsTableProps) {
  return (
    <Card>
      <CardHeader title="Pagos recibidos" />
      <Table
        data={payments}
        columns={COLUMNS}
        perPage={15}
        initialOrder={INITIAL_ORDER}
        rowId={(f) => f.p.id}
        name="pagos"
        empty="No hay pagos registrados"
      />
    </Card>
  )
}
