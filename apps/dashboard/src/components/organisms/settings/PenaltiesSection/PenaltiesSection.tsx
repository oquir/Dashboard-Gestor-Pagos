import { number, STATUTORY_PENALTIES } from '../../../../lib'
import type { SettingsEdit } from '../../../../types'
import { Input } from '../../../atoms'
import { Field, Section } from '../../../molecules'
import { PENALTY_KEYS, PENALTY_LABELS, PENALTY_USE } from './PenaltiesSection.constants'

/** Sanciones del municipio, con el máximo de ley de cada una. */
export default function PenaltiesSection({ b, change, editable, errors }: SettingsEdit) {
  return (
    <Section
      title="Sanciones"
      description="La ley es el tope: el municipio solo puede bajarlas (art. 59 de la Ley 788 de 2002)."
    >
      {PENALTY_KEYS.map((key) => (
        <Field
          key={key}
          label={PENALTY_LABELS[key]}
          help={[`Máximo de ley: ${STATUTORY_PENALTIES[key]}`, PENALTY_USE[key]]
            .filter(Boolean)
            .join('. ')}
          error={errors[key]}
        >
          <Input
            type="number"
            min={0}
            step="0.5"
            disabled={!editable}
            value={b.penalties[key]}
            onChange={(e) =>
              change({ penalties: { ...b.penalties, [key]: number(e.target.value) } })
            }
          />
        </Field>
      ))}
    </Section>
  )
}
