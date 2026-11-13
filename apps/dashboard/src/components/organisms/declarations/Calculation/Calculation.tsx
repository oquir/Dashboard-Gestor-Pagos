import { Download } from 'reicon-react'
import { downloadDeclaration, TOTAL_LINES } from '../../../../lib'
import { useData } from '../../../../store'
import { Button, Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Table from '../../Table'
import { LINE_COLUMNS } from './Calculation.constants'
import type { CalculationProps } from './Calculation.types'

/** Renglones de la declaración, con subtotales y totales resaltados, y su descarga en PDF. */
export default function Calculation({ d }: CalculationProps) {
  return (
    <Card>
      <CardHeader
        title="Liquidación"
        description="Valores redondeados al múltiplo de mil más cercano."
        actions={
          <Button variant="secondary" onClick={() => downloadDeclaration(d, useData.getState())}>
            <Download className="size-4" aria-hidden /> Descargar PDF
          </Button>
        }
      />
      <Table
        data={d.lines}
        columns={LINE_COLUMNS}
        dense
        rowClass={(r) => (TOTAL_LINES.has(r.code) ? 'bg-surface-sunken font-semibold' : '')}
      />
    </Card>
  )
}
