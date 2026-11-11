import type { AuditLogEntry } from '../../../../types'

export interface AuditLogTableProps {
  entries: AuditLogEntry[]
  /** Cuántos hay sin los filtros, para el pie de la tabla. */
  total: number
}
