import { useState } from 'react'
import { useData } from '../../../../store'
import MunicipalityFields, {
  dataOf,
  hasErrors,
  municipalityErrors,
  type MunicipalityData,
} from '../MunicipalityFields'
import type { EditMunicipalityProps } from './EditMunicipality.types'
import type { MunicipalitySwitches } from '../../../../types'
import { toast } from 'sonner'
import { Card } from '../../../atoms'
import { CardHeader, SaveBar } from '../../../molecules'
import { composeMunicipality, switchesOf } from './EditMunicipality.utils'
import MunicipalityModules from '../MunicipalityModules'
import MunicipalityForms from '../MunicipalityForms'

export default function EditMunicipality({ municipality: m, pausas }: EditMunicipalityProps) {
  const editMunicipality = useData((s) => s.editMunicipality)
  const [data, setData] = useState<MunicipalityData>(() => dataOf(m))
  const [sw, setSw] = useState<MunicipalitySwitches>(() => switchesOf(m))
  const changeSw = (partial: Partial<MunicipalitySwitches>) =>
    setSw((current) => ({ ...current, ...partial }))

  const errors = municipalityErrors(data)
  const saved = composeMunicipality(m, data, sw)
  const modification = JSON.stringify(saved) !== JSON.stringify(m)

  const save = () => {
    if (hasErrors(errors)) return
    editMunicipality(saved) // ← un solo PUT en la bitácora, con todo el payload
    setData(dataOf(saved)) // re-normaliza (trim/lowercase): si no, SaveBar no se apaga
    toast.success('Datos del municipio guardados.')
  }

  const discard = () => {
    setData(dataOf(m))
    setSw(switchesOf(m))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Datos básicos" />
        <div className="p-5">
          <MunicipalityFields data={data} change={setData} showErrors />
        </div>
      </Card>

      <MunicipalityModules switches={sw} pausas={pausas} change={changeSw} />
      <MunicipalityForms switches={sw} pausas={pausas} change={changeSw} />

      <SaveBar
        modification={modification}
        hasErrors={Object.values(errors).some(Boolean)}
        onDiscard={discard}
        onSave={save}
      />
    </div>
  )
}
