import { Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Table from '../../Table'
import { COLUMNS, INITIAL_ORDER } from './UnremittedWithholdings.constants'
import type { UnremittedWithholdingsProps } from './UnremittedWithholdings.types'

/** ReteICA y AutoReteICA con saldo y el plazo que les queda para consignarlo (art. 402 del Código Penal). */
export default function UnremittedWithholdings({ rows }: UnremittedWithholdingsProps) {
  return (
    <Card>
      <CardHeader
        title="Retenciones sin consignar"
        description="ReteICA y AutoReteICA que no se han pagado completas. El agente tiene 2 meses desde el vencimiento para consignar lo retenido; después, puede ser delito (art. 402 del Código Penal). Si paga todo con intereses, se puede cerrar el proceso penal."
      />
      <Table
        data={rows}
        columns={COLUMNS}
        perPage={10}
        initialOrder={INITIAL_ORDER}
        rowId={(f) => f.d.id}
        name="retenciones sin consignar"
        empty="Todo lo retenido está consignado"
      />
    </Card>
  )
}
