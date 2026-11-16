import { roleLabel } from '../../../../lib'
import type { Role } from '../../../../types'
import { Input, Select } from '../../../atoms'
import { Field } from '../../../molecules'
import type { UserFieldsProps } from './UserFields.types'
import { userErrors } from './UserFields.utils'

/** Los campos de un usuario, los mismos al crearlo y al editarlo. */
export default function UserFields({
  data,
  change,
  showErrors,
  roles,
  municipalities,
  className = 'grid gap-4 sm:grid-cols-2',
}: UserFieldsProps) {
  const errors: Partial<ReturnType<typeof userErrors>> = showErrors ? userErrors(data) : {}

  return (
    <div className={className}>
      <Field label="Nombres" error={errors.firstNames}>
        <Input
          autoComplete="given-name"
          value={data.firstNames}
          onChange={(e) => change({ ...data, firstNames: e.target.value })}
        />
      </Field>
      <Field label="Apellidos" error={errors.lastNames}>
        <Input
          autoComplete="family-name"
          value={data.lastNames}
          onChange={(e) => change({ ...data, lastNames: e.target.value })}
        />
      </Field>
      <Field label="Cargo">
        <Input
          placeholder="Ej.: Profesional de Rentas"
          value={data.jobTitle}
          onChange={(e) => change({ ...data, jobTitle: e.target.value })}
        />
      </Field>
      <Field label="Correo" error={errors.email}>
        <Input
          type="email"
          value={data.email}
          onChange={(e) => change({ ...data, email: e.target.value })}
        />
      </Field>
      <Field label="Rol">
        <Select
          value={data.role}
          onChange={(e) => change({ ...data, role: e.target.value as Role })}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {roleLabel[r]}
            </option>
          ))}
        </Select>
      </Field>
      {municipalities && data.role !== '1cero1' && (
        <Field label="Municipio">
          <Select
            value={data.municipalityId}
            onChange={(e) => change({ ...data, municipalityId: e.target.value })}
          >
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
    </div>
  )
}
