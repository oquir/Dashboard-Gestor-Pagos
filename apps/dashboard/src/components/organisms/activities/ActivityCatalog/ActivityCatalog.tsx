import { useState } from 'react'
import { can, activitiesOf, useSession } from '../../../../lib'
import { useData } from '../../../../store'
import type { Preview } from '../../../../types'
import ActivityUpload from '../ActivityUpload'
import ActivitiesTable from '../ActivitiesTable'
import type { ActivityCatalogProps } from './ActivityCatalog.types'

/** Actividades de un año gravable del municipio: la carga desde Excel (si el rol puede) y el listado. */
export default function ActivityCatalog({ municipalityId, fiscalYear }: ActivityCatalogProps) {
  const { user } = useSession()
  const uploads = useData((s) => s.activities)
  const canUpload = can(user?.role, 'loadActivities')
  const [view, setView] = useState<Preview | null>(null)

  const ofMunicipality = uploads.filter((c) => c.municipalityId === municipalityId)
  const current = ofMunicipality.find((c) => c.fiscalYear === fiscalYear)
  // La plantilla de un año sin cargar trae las del año anterior, para no empezar de cero.
  const base =
    activitiesOf(uploads, municipalityId, fiscalYear) ??
    ofMunicipality.toSorted((a, b) => b.fiscalYear - a.fiscalYear)[0]

  return (
    <div className="space-y-6">
      {canUpload && (
        <ActivityUpload
          municipalityId={municipalityId}
          fiscalYear={fiscalYear}
          base={base}
          current={current}
          view={view}
          changeView={setView}
        />
      )}
      <ActivitiesTable
        fiscalYear={fiscalYear}
        current={current}
        view={view}
        canUpload={canUpload}
      />
    </div>
  )
}
