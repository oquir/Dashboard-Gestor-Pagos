import { number, formatPesos, STATUTORY_PENALTIES, UVT } from '../../../../lib'
import type { SettingsEdit } from '../../../../types'
import { Input } from '../../../atoms'
import { Field, Section } from '../../../molecules'
import { PENALTY_INFO, PENALTY_KEYS, PENALTY_LABELS } from './PenaltiesSection.constants'

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
          help={
            key === 'minimumUvt'
              ? `${formatPesos(b.penalties.minimumUvt * UVT)}. Máximo de ley: ${STATUTORY_PENALTIES[key]}`
              : `Máximo de ley: ${STATUTORY_PENALTIES[key]}`
          }
          info={PENALTY_INFO[key]}
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
