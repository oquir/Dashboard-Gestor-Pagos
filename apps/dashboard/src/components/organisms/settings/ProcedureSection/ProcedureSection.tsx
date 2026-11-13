import { number } from '../../../../lib'
import type { MunicipalityConfig } from '../../../../types'
import { Input, Select } from '../../../atoms'
import { Field, Toggle, Section } from '../../../molecules'
import type { ProcedureSectionProps } from './ProcedureSection.types'

/** Corrección a la baja y, si el municipio tiene el RIT en el aplicativo, sus plazos y su cancelación. */
export default function ProcedureSection({ b, change, editable, withRit }: ProcedureSectionProps) {
  return (
    <Section title={withRit ? 'Procedimiento y RIT' : 'Procedimiento'}>
      <Field
        label="Corrección a la baja"
        help="Directa: el contribuyente presenta la corrección dentro del año siguiente al vencimiento y reemplaza a la anterior. Con solicitud: el municipio tiene 6 meses para aceptarla o rechazarla, y si no responde, se acepta sola. Aplica a lo que se radique desde el cambio."
      >
        <Select
          disabled={!editable}
          value={b.downwardCorrection}
          onChange={(e) =>
            change({
              downwardCorrection: e.target.value as MunicipalityConfig['downwardCorrection'],
            })
          }
        >
          <option value="direct_correction">
            Corrección directa (art. 589 vigente, Ley 1819 de 2016)
          </option>
          <option value="project_589">
            Solicitud con proyecto de corrección (art. 589 anterior)
          </option>
        </Select>
      </Field>
      <Toggle
        label="Permitir declarar sin calendario"
        help="Encendido: se reciben las declaraciones de un año gravable sin calendario cargado, y quedan marcadas."
        info="Sin el calendario, la declaración no conoce su vencimiento: la sanción por extemporaneidad y los intereses pueden salir mal. Si lo apagas, el formulario no deja declarar un año gravable hasta que el municipio cargue su calendario en la página Calendario."
        value={b.allowFilingWithoutCalendar}
        isDisabled={!editable}
        onChange={(v) => change({ allowFilingWithoutCalendar: v })}
      />
      {withRit && (
        <>
          <Field label="Plazo para inscribirse en el RIT (meses desde el inicio de actividades)">
            <Input
              type="number"
              min={0}
              disabled={!editable}
              value={b.registrationTermMonths}
              onChange={(e) => change({ registrationTermMonths: number(e.target.value) })}
            />
          </Field>
          <Toggle
            label="Cancelación automática del RIT"
            help="Si está apagado, la administración verifica el cese antes de aprobar la cancelación."
            value={b.automaticRitCancellation}
            isDisabled={!editable}
            onChange={(v) => change({ automaticRitCancellation: v })}
          />
        </>
      )}
    </Section>
  )
}
