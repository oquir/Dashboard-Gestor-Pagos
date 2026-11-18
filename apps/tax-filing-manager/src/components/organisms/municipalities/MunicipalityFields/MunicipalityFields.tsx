import { Input, Select } from '../../../atoms'
import { ColorPickerField, Field } from '../../../molecules'
import type { Bank } from '../../../../types'
import { BANKS, DEPARTMENTS, PROVIDERS } from './MunicipalityFields.constants'
import type { MunicipalityFieldsProps } from './MunicipalityFields.types'
import { dvOf, municipalityErrors } from './MunicipalityFields.utils'

/** Los datos básicos de un municipio, los mismos al crearlo y al editarlo. */
export default function MunicipalityFields({ data, change, showErrors }: MunicipalityFieldsProps) {
  const errors: Partial<ReturnType<typeof municipalityErrors>> = showErrors
    ? municipalityErrors(data)
    : {}
  const changeNit = (nit: string) => change({ ...data, nit, dv: dvOf(nit) })

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        <Field label="Banco" error={errors.bank}>
          <Select
            value={data.bank}
            onChange={(e) => change({ ...data, bank: e.target.value as Bank | '' })}
          >
            <option value="">Selecciona… </option>
            {BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Nombre" error={errors.name}>
          <Input
            autoComplete="organization"
            value={data.name}
            onChange={(e) => change({ ...data, name: e.target.value })}
          />
        </Field>

        <Field label="Nit" error={errors.nit}>
          <Input
            inputMode="numeric"
            placeholder="Ej.: 8920012345"
            value={data.nit}
            onChange={(e) => changeNit(e.target.value)}
          />
        </Field>

        <Field label="DV" error={errors.dv}>
          <Input disabled value={data.dv} placeholder="Ej.: 6" />
        </Field>

        <Field label="Código DANE" error={errors.daneCode}>
          <Input
            inputMode="numeric"
            placeholder="Ej.: 25875"
            value={data.daneCode}
            onChange={(e) => change({ ...data, daneCode: e.target.value })}
          />
        </Field>

        <Field label="Departamento" error={errors.department}>
          <Select
            value={data.department}
            onChange={(e) => change({ ...data, department: e.target.value })}
          >
            <option value="">Selecciona… </option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => change({ ...data, email: e.target.value })}
          />
        </Field>

        <Field label="Proveedor" error={errors.provider}>
          <Select
            value={data.provider}
            onChange={(e) => change({ ...data, provider: Number(e.target.value) })}
          >
            <option value={0}>Selecciona… </option>
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div>
        <ColorPickerField
          value={data.color}
          change={(color) => change({ ...data, color })}
          error={errors.color}
        />
      </div>
    </div>
  )
}
