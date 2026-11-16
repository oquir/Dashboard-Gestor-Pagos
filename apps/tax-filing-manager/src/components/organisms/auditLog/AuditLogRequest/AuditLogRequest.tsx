import { roleLabel, formatDate, formatTime } from '../../../../lib'
import { useData } from '../../../../store'
import { Badge, Card } from '../../../atoms'
import { CardHeader, DataItem } from '../../../molecules'
import { municipalityName, resultText } from '../AuditLogTable'
import type { AuditLogRequestProps } from './AuditLogRequest.types'

/** Quién hizo la petición, cuándo, a qué endpoint y si salió bien. */
export default function AuditLogRequest({ r }: AuditLogRequestProps) {
  const municipalities = useData((s) => s.municipalities)

  return (
    <Card>
      <CardHeader title="Petición" />
      <dl className="space-y-4 p-5">
        <DataItem label="Fecha y hora">
          {formatDate(r.dateTime.slice(0, 10))}, {formatTime(r.dateTime)}
        </DataItem>
        <DataItem label="Usuario">
          {r.user.name}
          <span className="block text-xs text-fg-muted">{roleLabel[r.user.role]}</span>
        </DataItem>
        <DataItem label="Municipio">{municipalityName(r, municipalities)}</DataItem>
        <DataItem label="Controlador">{r.controller}</DataItem>
        <DataItem label="Acción">
          <span className="font-mono">{r.action}</span>
        </DataItem>
        <DataItem label="Endpoint">
          <span className="break-all font-mono">{r.endpoint}</span>
        </DataItem>
        <DataItem label="Resultado">
          <Badge tone={r.success ? 'success' : 'danger'}>{resultText(r)}</Badge>
        </DataItem>
      </dl>
    </Card>
  )
}
