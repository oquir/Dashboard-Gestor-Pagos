import { columnHelper } from '../../../../lib'
import type { Registration, Municipality, RegistrationStatus } from '../../../../types'

export const col = columnHelper<Registration>()

const STATUS_ORDER: RegistrationStatus[] = ['active', 'under_review', 'rejected', 'cancelled']

/** Cuántas inscripciones hay en cada estado, en el orden en que se muestran en el pie. */
export const countByStatus = (registrations: Registration[]) =>
  STATUS_ORDER.map((status) => ({
    status,
    count: registrations.filter((i) => i.status === status).length,
  }))

export const municipalityColumn = (municipalities: Municipality[]) =>
  col.accessor((i) => municipalities.find((m) => m.id === i.municipalityId)?.name ?? '', {
    id: 'municipality',
    header: 'Municipio',
    meta: { classes: 'whitespace-nowrap text-fg' },
  })
