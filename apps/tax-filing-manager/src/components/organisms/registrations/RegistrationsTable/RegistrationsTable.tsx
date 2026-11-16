import { useMemo } from 'react'
import { registrationStatusLabel, registrationTone, useSession } from '../../../../lib'
import { useData } from '../../../../store'
import { Badge } from '../../../atoms'
import Table from '../../Table'
import { COLUMNS } from './RegistrationsTable.constants'
import type { RegistrationsTableProps } from './RegistrationsTable.types'
import { col, countByStatus, municipalityColumn } from './RegistrationsTable.utils'

/** Inscritos en el RIT. Cuando 1cero1 mira todos los municipios, agrega la columna de municipio. */
export default function RegistrationsTable({ registrations, total }: RegistrationsTableProps) {
  const { municipalityId } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const columns = useMemo(
    () =>
      municipalityId === null
        ? col.columns([...COLUMNS, municipalityColumn(municipalities)])
        : COLUMNS,
    [municipalityId, municipalities],
  )

  const states = useMemo(() => countByStatus(registrations), [registrations])

  return (
    <Table
      data={registrations}
      columns={columns}
      perPage={15}
      rowId={(i) => i.id}
      name={`inscripciones (de ${total})`}
      empty="No hay inscripciones con esos filtros"
      summary={
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Las activas siempre salen; los demás estados, solo si hay alguna. */}
          {states
            .filter(({ status, count }) => count > 0 || status === 'active')
            .map(({ status, count }) => (
              <Badge key={status} tone={registrationTone[status]}>
                {registrationStatusLabel[status]} {count}
              </Badge>
            ))}
        </div>
      }
    />
  )
}
