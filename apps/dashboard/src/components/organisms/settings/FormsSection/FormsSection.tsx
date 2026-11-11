import { useState } from 'react'
import { formLabel, formatDate, fullName, useSession } from '../../../../lib'
import type { Form, DisabledForm } from '../../../../types'
import { today } from '../../../../utils'
import { Toggle, ReasonModal, Section } from '../../../molecules'
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
      prior ? { ...prior, reason } : { reason, date: today(), por: user ? fullName(user) : '' },
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
              help={
                !d
                  ? HELP[f]
                  : saved
                    ? `Desactivado el ${formatDate(saved.date)} por ${saved.por}.`
                    : 'Se desactiva al guardar los cambios.'
              }
              value={!d}
              isDisabled={!editable}
              onChange={(isActive) => (isActive ? assign(f, undefined) : setRequesting(f))}
            />
            {d && (
              // Alineado con la etiqueta del interruptor.
              <p className="pl-12 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Motivo:</span>{' '}
                {d.reason || <span className="text-red-600">{errors[`motivo-${f}`]}</span>}
                {editable && (
                  <button
                    type="button"
                    className="ml-2 font-medium text-brand-700 hover:underline"
                    onClick={() => setRequesting(f)}
                  >
                    Cambiar
                  </button>
                )}
              </p>
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
