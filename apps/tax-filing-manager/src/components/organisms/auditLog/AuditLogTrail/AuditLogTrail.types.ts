import type { AuditLogEntry } from '../../../../types'

export interface AuditLogTrailProps {
  /** El de número inmediatamente menor y el de número inmediatamente mayor; sin él, el botón se desactiva. */
  previous?: AuditLogEntry
  nextOne?: AuditLogEntry
  /** Qué se recorre: "Villeta" o "todos los municipios". */
  scope: string
}
