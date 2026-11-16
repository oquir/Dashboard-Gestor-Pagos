import { useState } from 'react'
import { can, formLabel, fullName, useSession } from '../../../../lib'
import type { Form, DisabledForm } from '../../../../types'
import { today } from '../../../../utils'
import { DisabledBadge, Toggle, ReasonModal, Section } from '../../../molecules'
import { HELP } from './FormsSection.constants'
import type { FormsSectionProps } from './FormsSection.types'

/**
 * Formularios que el municipio ofrece a los contribuyentes. Solo 1cero1 desactiva uno, y da el motivo en una ventana;
 * el municipio ve la etiqueta Desactivado y, al pasar el mouse, el motivo.
 */
export default function FormsSection({
  b,
  change,
  editable,
  errors,
  forms,
  savedOnes,
}: FormsSectionProps) {
  const { user } = useSession()
  const canDisable = editable && can(user?.role, 'disableForms')
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
      description={
        canDisable
          ? 'Desactivar un formulario impide que los contribuyentes lo diligencien; lo que ya radicaron se sigue gestionando aquí. Hay que indicar el motivo.'
          : 'Los formularios que el municipio ofrece a los contribuyentes. Si 1cero1 desactiva uno, pasa el mouse sobre su etiqueta para ver el motivo.'
      }
    >
      {forms.map((f) => {
        const d = disabledOnes[f]
        const saved = savedOnes[f]
        if (!canDisable)
          return (
            <div key={f}>
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                {formLabel[f]}
                {d && <DisabledBadge disabled={d} />}
              </p>
              <p className="text-xs text-fg-muted">{HELP[f]}</p>
            </div>
          )
        return (
          <div key={f} className="space-y-1.5">
            <Toggle
              label={formLabel[f]}
              help={HELP[f]}
              value={!d}
              onChange={(isActive) => (isActive ? assign(f, undefined) : setRequesting(f))}
            />
            {d && (
              // Alineado con la etiqueta del interruptor.
              <div className="ml-12 flex flex-wrap items-center gap-x-3 gap-y-1">
                <DisabledBadge
                  disabled={d}
                  meta={saved ? undefined : 'Se desactiva al guardar los cambios.'}
                />
                <button
                  type="button"
                  className="text-xs font-medium text-brand-fg hover:underline"
                  onClick={() => setRequesting(f)}
                >
                  Cambiar motivo
                </button>
                {!d.reason && <span className="text-xs text-danger">{errors[`motivo-${f}`]}</span>}
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
