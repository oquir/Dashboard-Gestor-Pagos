import { useState } from 'react'
import { formLabel, fullName, useSession } from '../../../../lib'
import type { Form, DisabledForm } from '../../../../types'
import { today } from '../../../../utils'
import { DisabledNotice, Toggle, ReasonModal, Section } from '../../../molecules'
import { HELP } from './FormsSection.constants'
import type { FormsSectionProps } from './FormsSection.types'

/** Formularios que el municipio ofrece a los contribuyentes. Para desactivar uno hay que dar el motivo en una ventana. */
export default function FormsSection({
  b,
  change,
  editable,
  errors,
  forms,
  savedOnes,
}: FormsSectionProps) {
  const { user } = useSession()
  /** El formulario del que se pide el motivo: el que se está apagando o el que ya está apagado. */
  const [requesting, setRequesting] = useState<Form | null>(null)
  const disabledOnes = b.disabledForms

  const assign = (f: Form, disabled: DisabledForm | undefined) => {
    const nextOnes = { ...disabledOnes, [f]: disabled }
    if (!disabled) delete nextOnes[f]
    change({ disabledForms: nextOnes })
  }
  // Cambiar el motivo conserva cuándo y quién lo desactivó, y lo mismo al volver a apagar uno que estaba guardado como desactivado.
  const disable = (f: Form, reason: string) => {
    const prior = disabledOnes[f] ?? savedOnes[f]
    assign(
      f,
      prior ? { ...prior, reason } : { reason, date: today(), by: user ? fullName(user) : '' },
    )
    setRequesting(null)
  }

  return (
    <Section
      title="Formularios"
      description="Desactivar un formulario impide que los contribuyentes lo diligencien; lo que ya radicaron se sigue gestionando aquí. Hay que indicar el motivo."
    >
      {forms.map((f) => {
        const d = disabledOnes[f]
        const saved = savedOnes[f]
        return (
          <div key={f} className="space-y-1.5">
            <Toggle
              label={formLabel[f]}
              help={HELP[f]}
              value={!d}
              isDisabled={!editable}
              onChange={(isActive) => (isActive ? assign(f, undefined) : setRequesting(f))}
            />
            {d && (
              // Alineado con la etiqueta del interruptor.
              <div className="ml-12">
                <DisabledNotice
                  disabled={d}
                  meta={saved ? undefined : 'Se desactiva al guardar los cambios.'}
                  missingReason={errors[`motivo-${f}`]}
                  action={
                    editable && (
                      <button
                        type="button"
                        className="text-xs font-medium text-brand-700 hover:underline"
                        onClick={() => setRequesting(f)}
                      >
                        Cambiar
                      </button>
                    )
                  }
                />
              </div>
            )}
          </div>
        )
      })}

      {requesting && (
        <ReasonModal
          title={
            disabledOnes[requesting] ? 'Cambiar el motivo' : `Desactivar ${formLabel[requesting]}`
          }
          description={
            disabledOnes[requesting]
              ? `${formLabel[requesting]} está desactivado.`
              : 'Los contribuyentes no podrán diligenciarlo; lo que ya radicaron se sigue gestionando aquí. Se desactiva al guardar los cambios.'
          }
          label="Motivo de la desactivación"
          placeholder="Ej.: se están actualizando las tarifas del año gravable."
          confirm={disabledOnes[requesting] ? 'Cambiar el motivo' : 'Desactivar'}
          danger={!disabledOnes[requesting]}
          initial={(disabledOnes[requesting] ?? savedOnes[requesting])?.reason}
          onConfirm={(reason) => disable(requesting, reason)}
          close={() => setRequesting(null)}
        />
      )}
    </Section>
  )
}
