import { useMemo } from 'react'
import { useData } from '../../../../store'
import Table from '../../Table'
import type { AuditLogTableProps } from './AuditLogTable.types'
import { auditLogColumns, INITIAL_ORDER } from './AuditLogTable.utils'

/** Los registros de la bitácora, del más reciente al más antiguo. El número abre el registro, con los datos enviados. */
export default function AuditLogTable({ entries, total }: AuditLogTableProps) {
  const municipalities = useData((s) => s.municipalities)
  const columns = useMemo(() => auditLogColumns(municipalities), [municipalities])

  return (
    <Table
      data={entries}
      columns={columns}
      perPage={20}
      initialOrder={INITIAL_ORDER}
      rowId={(r) => String(r.id)}
      name={`registros (de ${total})`}
      empty="No hay registros con esos filtros"
    />
  )
}
