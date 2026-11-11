import { useState } from 'react'
import { Select } from '../components/atoms'
import { PickMunicipality, PageHeader } from '../components/molecules'
import { MunicipalitySearch, ActivityCatalog } from '../components/organisms'
import { ONGOING_YEAR } from '../constants'
import { useSession } from '../lib'
import { useData } from '../store'

export default function Activities() {
  const { municipalityId } = useSession()
  const uploads = useData((s) => s.activities)
  const [picked, setPicked] = useState(ONGOING_YEAR)
  const loadedOnes = uploads
    .filter((c) => c.municipalityId === municipalityId)
    .map((c) => c.fiscalYear)
  const fiscalYears = [...new Set([...loadedOnes, ONGOING_YEAR, ONGOING_YEAR + 1])].sort(
    (a, b) => b - a,
  )
  // Si el municipio que se elige no tiene ese año, se vuelve al año en curso.
  const fiscalYear = fiscalYears.includes(picked) ? picked : ONGOING_YEAR

  return (
    <>
      <PageHeader
        title="Actividades económicas"
        description="Actividades CIIU y tarifas de cada año gravable. El administrador del municipio las carga cada año con la plantilla de Excel."
        actions={
          municipalityId && (
            <Select
              aria-label="Año gravable"
              value={fiscalYear}
              onChange={(e) => setPicked(Number(e.target.value))}
            >
              {fiscalYears.map((v) => (
                <option key={v} value={v}>
                  Año gravable {v}
                  {loadedOnes.includes(v) ? '' : ' (sin cargar)'}
                </option>
              ))}
            </Select>
          )
        }
      />
      <MunicipalitySearch all={false} />
      {municipalityId ? (
        // Al cambiar de municipio o de año se descartan la vista previa y los mensajes de la carga.
        <ActivityCatalog
          key={`${municipalityId}-${fiscalYear}`}
          municipalityId={municipalityId}
          fiscalYear={fiscalYear}
        />
      ) : (
        <PickMunicipality description="Búscalo arriba por su nombre para ver sus actividades." />
      )}
    </>
  )
}
