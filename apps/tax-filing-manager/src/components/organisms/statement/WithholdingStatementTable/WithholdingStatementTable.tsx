import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Table from '../../Table'
import { COLUMNS } from './WithholdingStatementTable.constants'
import type { WithholdingStatementTableProps } from './WithholdingStatementTable.types'

/** ReteICA y AutoReteICA del contribuyente. No suman al saldo del ICA: las retenciones no tienen estado de cuenta. */
export default function WithholdingStatementTable({ rows }: WithholdingStatementTableProps) {
  return (
    <Card>
      <CardHeader
        title="ReteICA y AutoReteICA"
        description="Las retenciones se declaran y se pagan completas, así que no tienen estado de cuenta. Aquí solo está el estado de cada declaración; no suman al saldo del ICA."
      />
      <Table
        data={rows}
        columns={COLUMNS}
        perPage={10}
        rowId={(r) => r.d.id}
        name="declaraciones de retención"
        empty="No tiene declaraciones de retención"
      />
    </Card>
  )
}
