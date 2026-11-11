import { Plus } from 'reicon-react'
import { useState } from 'react'
import { Navigate } from 'react-router'
import { Button } from '../components/atoms'
import { PageHeader } from '../components/molecules'
import { MunicipalitySearch, NewUser, UsersTable } from '../components/organisms'
import { can, ofMunicipality, useSession } from '../lib'
import { useData } from '../store'

export default function Users() {
  const { user, municipalityId } = useSession()
  const users = useData((s) => s.users)
  const [creating, setCreating] = useState(false)

  if (!can(user?.role, 'manageUsers')) return <Navigate to="/" replace />

  const list = municipalityId === null ? users : ofMunicipality(users, municipalityId)

  return (
    <>
      <PageHeader
        title="Usuarios"
        description={
          user?.role === '1cero1'
            ? 'Usuarios de todos los municipios y del equipo de 1cero1.'
            : 'Funcionarios y administradores de tu municipio.'
        }
        actions={
          !creating && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Plus className="size-4" aria-hidden /> Nuevo usuario
            </Button>
          )
        }
      />
      <MunicipalitySearch />
      {creating && <NewUser onFinish={() => setCreating(false)} />}
      <UsersTable users={list} />
    </>
  )
}
