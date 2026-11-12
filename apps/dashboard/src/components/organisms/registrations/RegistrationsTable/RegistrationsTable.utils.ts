import { columnHelper } from '../../../../lib'
import type { Registration, Municipality } from '../../../../types'

export const col = columnHelper<Registration>()

export const municipalityColumn = (municipalities: Municipality[]) =>
  col.accessor((i) => municipalities.find((m) => m.id === i.municipalityId)?.name ?? '', {
    id: 'municipality',
    header: 'Municipio',
    meta: { classes: 'whitespace-nowrap text-fg' },
  })
