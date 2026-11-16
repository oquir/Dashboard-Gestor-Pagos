import { useState } from 'react'
import { formatDate, normalize, overCap } from '../../../../lib'
import { Badge, Card } from '../../../atoms'
import { FilterBar, SearchBox, CardHeader, EmptyState } from '../../../molecules'
import Table from '../../Table'
import { COLUMNS } from './ActivitiesTable.constants'
import type { ActivitiesTableProps } from './ActivitiesTable.types'

/** Actividades y tarifas del año gravable o, mientras no se confirme, las del Excel que se está cargando. */
export default function ActivitiesTable({
  fiscalYear,
  current,
  view,
  canUpload,
}: ActivitiesTableProps) {
  const [text, setText] = useState('')
  const rows = view?.rates ?? current?.rates ?? []
  const outside = rows.filter(overCap).length
  const query = normalize(text)
  const foundOnes = query
    ? rows.filter((t) => t.ciiu.includes(query) || normalize(t.description).includes(query))
    : rows

  return (
    <Card>
      <CardHeader
        title={`Actividades del año gravable ${fiscalYear}`}
        description={
          view
            ? `Vista previa de ${view.file}: aún no se ha guardado.`
            : current &&
              `Cargadas por ${current.uploadedBy} el ${formatDate(current.uploadDate)} desde ${current.file}.`
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {view && <Badge tone="info">Vista previa</Badge>}
            {outside > 0 && <Badge tone="alert">{outside} fuera de los topes de ley</Badge>}
          </div>
        }
      />
      {rows.length > 0 ? (
        <>
          <FilterBar
            searchBox={
              <SearchBox
                type="search"
                aria-label="Buscar actividad"
                placeholder="Buscar por nombre de la actividad o código CIIU"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            }
          />
          <Table
            data={foundOnes}
            columns={COLUMNS}
            rowId={(t) => t.ciiu}
            dense
            name="actividades"
            empty="Ninguna actividad coincide con la búsqueda"
          />
        </>
      ) : (
        <EmptyState
          title={`Sin actividades para ${fiscalYear}`}
          description={
            canUpload
              ? 'Descarga la plantilla, llénala y cárgala.'
              : 'El administrador del municipio aún no las ha cargado.'
          }
        />
      )}
    </Card>
  )
}
