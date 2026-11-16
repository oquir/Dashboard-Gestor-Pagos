import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router'
import { Badge } from '../components/atoms'
import { EmptyState } from '../components/molecules'
import { SentData, AuditLogRequest, AuditLogTrail } from '../components/organisms'
import { resultText } from '../components/organisms/auditLog/AuditLogTable'
import { TemplateDetail } from '../components/templates'
import {
  afterHours,
  neighbors,
  formatDate,
  formatTime,
  can,
  ofMunicipality,
  useSession,
} from '../lib'
import { useData } from '../store'

export default function AuditLogDetail() {
  const { id } = useParams()
  const { user, municipalityId } = useSession()
  const auditLog = useData((s) => s.auditLog)
  const municipalities = useData((s) => s.municipalities)
  const number = Number(id)
  const r = auditLog.find((x) => x.id === number)

  // Anterior y Siguiente recorren lo mismo que la tabla con el municipio elegido; sin municipio, todos los registros.
  const { previous, nextOne } = useMemo(
    () => neighbors(ofMunicipality(auditLog, municipalityId), number),
    [auditLog, municipalityId, number],
  )
  const scope = municipalities.find((m) => m.id === municipalityId)?.name ?? 'todos los municipios'

  if (!can(user?.role, 'canSeeAuditLog')) return <Navigate to="/" replace />
  if (!r)
    return (
      <EmptyState
        title="No se encontró el registro"
        description={`La bitácora no tiene un registro con el número ${id}.`}
      />
    )

  return (
    <TemplateDetail
      goBack={{ a: '/bitacora', text: 'Bitácora' }}
      title={`Registro N.º ${r.id}`}
      description={`${r.action} · ${formatDate(r.dateTime.slice(0, 10))}, ${formatTime(r.dateTime)}`}
      actions={
        <>
          <Badge tone={r.success ? 'success' : 'danger'}>{resultText(r)}</Badge>
          {afterHours(r) && <Badge tone="alert">Fuera de horario</Badge>}
        </>
      }
      notice={<AuditLogTrail previous={previous} nextOne={nextOne} scope={scope} />}
      main={<SentData r={r} />}
      side={<AuditLogRequest r={r} />}
    />
  )
}
