import { Download } from 'reicon-react'
import { COLUMNS, NO_APPROVAL, REPORT_FILE_NAMES, createXlsx, downloadBlob } from '../../../../lib'
import { today } from '../../../../utils'
import { Button, Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import Table from '../../Table'
import { NO_APPROVAL_TABLE, TABLES } from './ReportTable.constants'
import type { ReportTableProps } from './ReportTable.types'

/** Datos del reporte elegido, paginados, y su descarga en Excel. */
export default function ReportTable({
  report,
  rows,
  withoutApproval,
  from,
  to,
  invalidRange,
}: ReportTableProps) {
  const definition = withoutApproval ? NO_APPROVAL : COLUMNS[report.id]

  const download = () => {
    const workbook = createXlsx({
      name: report.title,
      rows: [
        definition.map((c) => c.title),
        ...(withoutApproval ? rows.map((f) => f.slice(0, -1)) : rows),
      ],
      widths: definition.map((c) => c.width),
      pesoColumns: definition.flatMap((c, i) => (c.format === 'pesos' ? [i] : [])),
    })
    downloadBlob(
      workbook,
      report.byDates
        ? `reporte_${REPORT_FILE_NAMES[report.id]}_${from}_a_${to}.xlsx`
        : `reporte_${REPORT_FILE_NAMES[report.id]}_${today()}.xlsx`,
    )
  }

  return (
    <Card>
      <CardHeader
        title={report.title}
        description={report.description}
        actions={
          <Button variant="primary" disabled={rows.length === 0} onClick={download}>
            <Download className="size-4" aria-hidden /> Descargar Excel
          </Button>
        }
      />
      <Table
        data={rows}
        columns={withoutApproval ? NO_APPROVAL_TABLE : TABLES[report.id]}
        perPage={10}
        name={rows.length === 1 ? 'registro' : 'registros'}
        empty={
          report.byDates && invalidRange
            ? 'Corrige el rango de fechas'
            : 'No hay registros para mostrar'
        }
      />
    </Card>
  )
}
