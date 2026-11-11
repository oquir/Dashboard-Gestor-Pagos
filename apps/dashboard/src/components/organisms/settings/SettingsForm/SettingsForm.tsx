import { useState } from 'react'
import { ALL_ACTIVE } from '../../../../constants'
import { settingsErrors, formsOf, TAXES, acceptsChecks } from '../../../../lib'
import { useData } from '../../../../store'
import type { MunicipalityConfig } from '../../../../types'
import { SaveBar } from '../../../molecules'
import PriorApprovalSection from '../PriorApprovalSection'
import FormsSection from '../FormsSection'
import OfficialsSection from '../OfficialsSection'
import IcaSection from '../IcaSection'
import PaymentsSection from '../PaymentsSection'
import ProcedureSection from '../ProcedureSection'
import WithholdingSection from '../WithholdingSection'
import PenaltiesSection from '../PenaltiesSection'
import type { SettingsFormProps } from './SettingsForm.types'

/**
 * Configuración del municipio como borrador: se valida mientras se edita y al final se guarda o se descarta.
 * Los vencimientos, su periodicidad y el pronto pago se editan aparte, en la página Calendario.
 */
export default function SettingsForm({ config, editable }: SettingsFormProps) {
  const saveSettings = useData((s) => s.saveSettings)
  // Solo se configura lo que el municipio tiene activo: impuestos y RIT (los define 1cero1).
  const municipality = useData((s) => s.municipalities.find((m) => m.id === config.municipalityId))
  const taxes = municipality?.taxes ?? ALL_ACTIVE
  const withRit = municipality?.rit ?? true
  const withApproval = TAXES.filter((i) => taxes[i] && municipality?.priorApproval[i])
  const [b, setB] = useState(config)
  const [saved, setSaved] = useState(false)
  const change = (partial: Partial<MunicipalityConfig>) => {
    setB((current) => ({ ...current, ...partial }))
    setSaved(false)
  }

  const errors = settingsErrors(b)
  const modification = JSON.stringify(b) !== JSON.stringify(config)
  const editing = { b, change, editable, errors }

  return (
    <div className="space-y-6">
      {municipality && (
        <FormsSection {...editing} forms={formsOf(municipality)} savedOnes={config.disabledForms} />
      )}
      {(taxes.reteica || taxes.selfWithholding) && (
        <WithholdingSection {...editing} taxes={taxes} />
      )}
      {taxes.ica && <IcaSection {...editing} />}
      <ProcedureSection {...editing} withRit={withRit} />
      {acceptsChecks(municipality) && <PaymentsSection {...editing} />}
      {withApproval.length > 0 && <PriorApprovalSection {...editing} taxes={withApproval} />}
      <OfficialsSection {...editing} />
      <PenaltiesSection {...editing} />

      {editable && (
        <SaveBar
          modification={modification}
          hasErrors={Object.keys(errors).length > 0}
          saved={saved}
          savedMessage="Configuración guardada."
          onDiscard={() => {
            setB(config)
            setSaved(false)
          }}
          onSave={() => {
            saveSettings(b)
            setSaved(true)
          }}
        />
      )}
    </div>
  )
}
