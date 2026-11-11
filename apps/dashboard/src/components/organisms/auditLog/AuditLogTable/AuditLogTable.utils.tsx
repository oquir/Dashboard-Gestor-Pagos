import { Link } from 'react-router'
import { DocumentText } from 'reicon-react'
import { ROW_BUTTON_CLASS } from '../../../../constants'
import { afterHours, roleLabel, formatDate, formatTime, columnHelper } from '../../../../lib'
import type { Municipality, AuditLogEntry } from '../../../../types'
import { Badge } from '../../../atoms'

const col = columnHelper<AuditLogEntry>()

/** Lo que no es de un municipio, como el inicio de sesión de 1cero1. */
export const NO_MUNICIPALITY = 'Todo el aplicativo'

export const municipalityName = (r: AuditLogEntry, municipalities: Municipality[]) =>
  municipalities.find((m) => m.id === r.municipalityId)?.name ?? NO_MUNICIPALITY

export const resultText = (r: AuditLogEntry) => (r.success ? 'Salió bien' : 'Falló')

/** Lo más reciente primero: el número más alto. */
export const INITIAL_ORDER = [{ id: 'id', desc: true }]

export function auditLogColumns(municipalities: Municipality[]) {
  return col.columns([
    col.accessor('id', {
      header: 'N.º',
      meta: { classes: 'whitespace-nowrap' },
      cell: ({ row: { original: r } }) => (
        <Link
          to={`/bitacora/${r.id}`}
          aria-label={`Ver el registro ${r.id}`}
          className={ROW_BUTTON_CLASS}
        >
          <DocumentText className="size-4 text-brand-600" aria-hidden />
          {r.id}
        </Link>
      ),
    }),
    col.accessor('dateTime', {
      id: 'date',
      header: 'Fecha y hora',
      meta: { classes: 'whitespace-nowrap' },
      cell: ({ row: { original: r } }) => (
        <>
          <p className="text-slate-900">{formatDate(r.dateTime.slice(0, 10))}</p>
          <p className="flex items-center gap-1.5 text-xs tabular-nums text-slate-500">
            {formatTime(r.dateTime)}
            {afterHours(r) && <Badge tone="alert">Fuera de horario</Badge>}
          </p>
        </>
      ),
    }),
    col.accessor((r) => r.user.name, {
      id: 'user',
      header: 'Usuario',
      meta: { classes: 'whitespace-nowrap' },
      cell: ({ row: { original: r } }) => (
        <>
          <p className="font-medium text-slate-900">{r.user.name}</p>
          {r.user.role === '1cero1' ? (
            <Badge tone="info">1cero1</Badge>
          ) : (
            <p className="text-xs text-slate-500">{roleLabel[r.user.role]}</p>
          )}
        </>
      ),
    }),
    col.accessor((r) => municipalityName(r, municipalities), {
      id: 'municipality',
      header: 'Municipio',
      meta: { classes: 'whitespace-nowrap text-slate-700' },
    }),
    col.accessor('action', {
      header: 'Acción',
      meta: { classes: 'min-w-64' },
      cell: ({ row: { original: r } }) => (
        <>
          <p className="font-mono text-sm text-slate-900">{r.action}</p>
          <p className="text-xs text-slate-500">
            {r.controller} · <span className="break-all font-mono">{r.endpoint}</span>
          </p>
        </>
      ),
    }),
    col.accessor('success', {
      header: 'Resultado',
      meta: { classes: 'whitespace-nowrap' },
      cell: ({ row: { original: r } }) => (
        <Badge tone={r.success ? 'success' : 'danger'}>{resultText(r)}</Badge>
      ),
    }),
  ])
}
