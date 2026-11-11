import { useMemo } from 'react'
import { useSession } from '../../../../lib'
import { useData } from '../../../../store'
import Table from '../../Table'
import { COLUMNS } from './RegistrationsTable.constants'
import type { RegistrationsTableProps } from './RegistrationsTable.types'
import { col, municipalityColumn } from './RegistrationsTable.utils'

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

  return (
    <Table
      data={registrations}
      columns={columns}
      perPage={15}
      rowId={(i) => i.id}
      name={`inscripciones (de ${total})`}
      empty="No hay inscripciones con esos filtros"
    />
  )
}
