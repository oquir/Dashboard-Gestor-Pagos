import { approvalStatusLabel } from '../lib/format'
import type { ApprovalFilter, CorrectionFilter } from '../types'

/** Opciones del filtro por aprobación previa de los listados de declaraciones. */
export const APPROVAL_OPTIONS: Record<ApprovalFilter, string> = {
  '': 'Toda aprobación',
  ...approvalStatusLabel,
  not_applicable: 'Sin aprobación previa',
}

/** Opciones del filtro por corrección a la baja de los listados de declaraciones. */
export const CORRECTION_OPTIONS: Record<CorrectionFilter, string> = {
  '': 'Toda declaración',
  all: 'Todas las correcciones a la baja',
  direct: 'Correcciones directas',
  to_resolve: 'Solicitudes por resolver',
  accepted: 'Solicitudes aceptadas',
  accepted_by_silence: 'Solicitudes aceptadas por silencio',
  rejected: 'Solicitudes rechazadas',
}

/** Valor del filtro de correcciones en la URL (?correccion=...), que queda en español. */
export const CORRECTION_URL_VALUES: Record<string, Exclude<CorrectionFilter, ''>> = {
  todas: 'all',
  directa: 'direct',
  por_resolver: 'to_resolve',
  aceptada: 'accepted',
  aceptada_por_silencio: 'accepted_by_silence',
  rechazada: 'rejected',
}
