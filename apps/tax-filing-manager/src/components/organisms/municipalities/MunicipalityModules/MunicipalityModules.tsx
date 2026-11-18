import { useState } from 'react'
import { goLiveText } from '../../../../lib'
import { DisabledBadge, Toggle, Section } from '../../../molecules'
import GoLiveModal from '../GoLiveModal'
import { MODULE_INFO } from './MunicipalityModules.constants'
import type { MunicipalityModulesProps } from './MunicipalityModules.types'

/**
 * Lo que el municipio tiene en el aplicativo además de sus formularios de impuestos. La primera vez que se activa el
 * RIT se pide su fecha de salida a producción.
 */
export default function MunicipalityModules({
  switches: sw,
  pausas,
  change,
}: MunicipalityModulesProps) {
  const [requesting, setRequesting] = useState(false)

  return (
    <Section
      title="Módulos"
      description="Lo que el municipio tiene en el aplicativo además de sus formularios."
    >
      <div>
        <Toggle
          label="RIT en el aplicativo"
          help={`Inscripciones, actualizaciones y cancelaciones. ${goLiveText(sw.inProductionSince.rit)}.`}
          info={MODULE_INFO.rit}
          value={sw.rit}
          onChange={(checked) =>
            checked && !sw.inProductionSince.rit ? setRequesting(true) : change({ rit: checked })
          }
        />
        {sw.rit && pausas.rit && (
          <div className="mt-2 ml-12">
            <DisabledBadge disabled={pausas.rit} />
          </div>
        )}
      </div>
      <Toggle
        label="Carga de Asobancaria 2001"
        help="El municipio carga el recaudo de los pagos con código de barras, que el banco no notifica."
        info={MODULE_INFO.asobancariaUpload}
        value={sw.asobancariaUpload}
        onChange={(checked) => change({ asobancariaUpload: checked })}
      />

      {requesting && (
        <GoLiveModal
          form="rit"
          onConfirm={(date) => {
            change({ rit: true, inProductionSince: { ...sw.inProductionSince, rit: date } })
            setRequesting(false)
          }}
          close={() => setRequesting(false)}
        />
      )}
    </Section>
  )
}
