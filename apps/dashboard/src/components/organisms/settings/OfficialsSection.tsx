import type { SettingsEdit } from '../../../types'
import { Toggle, Section } from '../../molecules'

/** Lo que ven los funcionarios del municipio. */
export default function OfficialsSection({ b, change, editable }: SettingsEdit) {
  return (
    <Section title="Funcionarios" description="Lo que ven los funcionarios del municipio.">
      <Toggle
        label="Ocultar el recaudo del municipio"
        help="Encendido, los funcionarios no ven el recaudo del año en Inicio ni en Pagos, ni la gráfica de recaudo por años."
        value={b.hideCollectionFromOfficials}
        isDisabled={!editable}
        onChange={(v) => change({ hideCollectionFromOfficials: v })}
      />
    </Section>
  )
}
