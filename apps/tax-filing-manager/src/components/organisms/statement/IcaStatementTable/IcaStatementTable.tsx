import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Table from '../../Table'
import { COLUMNS, INITIAL_ORDER } from './IcaStatementTable.constants'
import type { IcaStatementTableProps } from './IcaStatementTable.types'

/** La declaración vigente del ICA de cada año gravable, con lo pagado y lo que falta. */
export default function IcaStatementTable({ rows }: IcaStatementTableProps) {
  return (
    <Card>
      <CardHeader
        title="ICA por vigencia"
        description="La declaración vigente de cada año gravable. Las reemplazadas por una corrección no se cuentan."
      />
      <Table
        data={rows}
        columns={COLUMNS}
        initialOrder={INITIAL_ORDER}
        rowId={(r) => r.d.id}
        empty="No tiene declaraciones del ICA"
      />
    </Card>
  )
}
