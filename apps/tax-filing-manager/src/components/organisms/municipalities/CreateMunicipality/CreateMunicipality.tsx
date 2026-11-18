import { useState } from 'react'
import { toast } from 'sonner'
import { Button, Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import { useData } from '../../../../store'
import type { Bank, Municipality } from '../../../../types'
import type { CreateMunicipalityProps } from './CreateMunicipality.types'
import MunicipalityFields, {
  type MunicipalityData,
  hasErrors,
  municipalityErrors,
} from '../MunicipalityFields'

/** El municipio queda activo y con su configuración por defecto. */
export default function CreateMunicipality({ onFinish }: CreateMunicipalityProps) {
  const createMunicipality = useData((s) => s.createMunicipality)

  const [data, setData] = useState<MunicipalityData>({
    bank: '',
    name: '',
    nit: '',
    dv: '',
    department: '',
    daneCode: '',
    email: '',
    provider: 0,
    color: '#3a3b3b',
  })

  const [attempted, setAttempted] = useState(false)
  const errors = municipalityErrors(data)
  const save = () => {
    setAttempted(true)
    if (hasErrors(errors)) return

    const newValue: Municipality = {
      id: `m${Date.now()}`,
      name: data.name.trim(),
      department: data.department,
      daneCode: data.daneCode.trim(),
      bank: data.bank as Bank,
      nit: data.nit.trim(),
      dv: data.dv,
      email: data.email.trim(),
      provider: data.provider,
      color: data.color.toLowerCase(),
      isActive: true,
      inProductionSince: {},
      taxes: { ica: false, reteica: false, selfWithholding: false },
      rit: false,
      validateAgainstRit: { ica: false, reteica: false, selfWithholding: false },
      priorApproval: { ica: false, reteica: false, selfWithholding: false },
      asobancariaUpload: false,
      cashPayment: { ica: false, reteica: false, selfWithholding: false },
      checkPayment: { ica: false, reteica: false, selfWithholding: false },
    }

    createMunicipality(newValue)
    toast.success(`Se creó el municipio ${newValue.name}.`)
    onFinish()
  }

  return (
    <Card className="mb-6">
      <CardHeader title="Nuevo municipio" />

      <div className="p-5">
        <MunicipalityFields data={data} change={setData} showErrors={attempted} />
      </div>

      <div className="flex justify-end gap-2 border-t border-border-subtle px-5 py-3">
        <Button variant="secondary" onClick={onFinish}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={save}>
          Crear municipio
        </Button>
      </div>
    </Card>
  )
}
