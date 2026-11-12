import { useState } from 'react'
import { roleLabel, useSession } from '../../../../lib'
import { useData } from '../../../../store'
import type { User } from '../../../../types'
import { Button, Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import UserFields, { userErrors, hasErrors, ROLES_1CERO1, MUNICIPALITY_ROLES } from '../UserFields'
import type { UserData } from '../UserFields'
import type { NewUserProps } from './NewUser.types'

/** Alta de un usuario: 1cero1 lo crea en cualquier municipio; el administrador, solo en el suyo. */
export default function NewUser({ onFinish }: NewUserProps) {
  const { user, municipalityId } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const saveUser = useData((s) => s.saveUser)
  const is1cero1 = user?.role === '1cero1'
  const roles = is1cero1 ? ROLES_1CERO1 : MUNICIPALITY_ROLES
  const [data, setData] = useState<UserData>({
    firstNames: '',
    lastNames: '',
    jobTitle: '',
    email: '',
    role: roles[0],
    municipalityId: municipalityId ?? municipalities[0].id,
  })
  const [attempted, setAttempted] = useState(false)

  const save = () => {
    setAttempted(true)
    if (hasErrors(userErrors(data))) return
    const newValue: User = {
      id: `u${Date.now()}`,
      firstNames: data.firstNames.trim(),
      lastNames: data.lastNames.trim(),
      jobTitle: data.jobTitle.trim() || roleLabel[data.role],
      email: data.email.trim(),
      role: data.role,
      municipalityId:
        data.role === '1cero1'
          ? null
          : is1cero1
            ? data.municipalityId
            : (user?.municipalityId ?? null),
      isActive: true,
    }
    saveUser(newValue)
    onFinish()
  }

  return (
    <Card className="mb-6">
      <CardHeader title="Nuevo usuario" />
      <div className="p-5">
        <UserFields
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data={data}
          change={setData}
          showErrors={attempted}
          roles={roles}
          municipalities={is1cero1 ? municipalities : undefined}
        />
      </div>
      <div className="flex justify-end gap-2 border-t border-border-subtle px-5 py-3">
        <Button variant="secondary" onClick={onFinish}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={save}>
          Crear usuario
        </Button>
      </div>
    </Card>
  )
}
