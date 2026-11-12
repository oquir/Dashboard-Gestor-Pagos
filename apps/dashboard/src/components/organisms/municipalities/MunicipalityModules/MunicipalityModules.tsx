import { useState } from 'react'
import { goLiveText } from '../../../../lib'
import { useData } from '../../../../store'
import { DisabledBadge, Toggle, Section } from '../../../molecules'
import GoLiveModal from '../GoLiveModal'
import type { MunicipalityModulesProps } from './MunicipalityModules.types'

/**
 * Lo que el municipio tiene en el aplicativo además de sus formularios de impuestos. La primera vez que se activa el
 * RIT se pide su fecha de salida a producción.
 */
export default function MunicipalityModules({ municipality: m, pausas }: MunicipalityModulesProps) {
  const toggleRit = useData((s) => s.toggleRit)
  const enableForm = useData((s) => s.enableForm)
  const toggleAsobancariaUpload = useData((s) => s.toggleAsobancariaUpload)
  const [requesting, setRequesting] = useState(false)

  return (
    <Section
      title="Módulos"
      description="Lo que el municipio tiene en el aplicativo además de sus formularios."
    >
      <div>
        <Toggle
          label="RIT en el aplicativo"
          help={`Inscripciones, actualizaciones y cancelaciones. ${goLiveText(m.inProductionSince.rit)}.`}
          value={m.rit}
          onChange={() =>
            !m.rit && !m.inProductionSince.rit ? setRequesting(true) : toggleRit(m.id)
          }
        />
        {m.rit && pausas.rit && (
          <div className="mt-2 ml-12">
            <DisabledBadge disabled={pausas.rit} />
          </div>
        )}
      </div>
      <Toggle
        label="Carga de Asobancaria 2001"
        help="El municipio carga el recaudo de los pagos con código de barras, que el banco no notifica."
        value={m.asobancariaUpload}
        onChange={() => toggleAsobancariaUpload(m.id)}
      />

      {requesting && (
        <GoLiveModal
          form="rit"
          onConfirm={(date) => {
            enableForm(m.id, 'rit', date)
            setRequesting(false)
          }}
          close={() => setRequesting(false)}
        />
      )}
    </Section>
  )
}
