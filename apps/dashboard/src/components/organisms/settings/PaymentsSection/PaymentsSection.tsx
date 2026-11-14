import type { SettingsEdit } from '../../../../types'
import { Toggle, Section } from '../../../molecules'
import { PAYMENTS_INFO } from './PaymentsSection.constants'

/** Cómo recibe el municipio los cheques de gerencia en su ventanilla. */
export default function PaymentsSection({ b, change, editable }: SettingsEdit) {
  return (
    <Section
      title="Pagos en ventanilla"
      description="Los cheques de gerencia que se reciben en la ventanilla del municipio."
    >
      <Toggle
        label="Recibir cheques por valor parcial"
        help="Apagado, el cheque debe cubrir todo el saldo pendiente de la declaración."
        info={PAYMENTS_INFO.partialCheck}
        value={b.partialCheck}
        isDisabled={!editable}
        onChange={(v) => change({ partialCheck: v })}
      />
    </Section>
  )
}
