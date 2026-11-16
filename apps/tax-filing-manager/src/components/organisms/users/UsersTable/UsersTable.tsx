import { useMemo, useState } from 'react'
import { useSession } from '../../../../lib'
import { useData } from '../../../../store'
import { Card } from '../../../atoms'
import Table from '../../Table'
import UserDetail from '../UserDetail'
import type { UsersTableProps } from './UsersTable.types'
import { userColumns, isManageable, municipalityName } from './UsersTable.utils'

/** Usuarios con su rol y estado. El botón de cada fila abre su detalle, donde se desactiva, se elimina o se le reenvían las credenciales. */
export default function UsersTable({ users }: UsersTableProps) {
  const { user } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const [viewId, setViewId] = useState<string | null>(null)
  const columns = useMemo(() => userColumns(municipalities, setViewId), [municipalities])
  // Se busca en cada render para que la ventana muestre el estado al día, y se cierre sola si el usuario se elimina.
  const viendo = users.find((u) => u.id === viewId)

  return (
    <Card>
      <Table
        data={users}
        columns={columns}
        rowId={(u) => u.id}
        name="usuarios"
        rowClass={(u) => (u.isActive ? 'hover:bg-surface-sunken' : 'bg-surface-sunken opacity-60')}
      />
      {viendo && (
        <UserDetail
          key={viendo.id}
          user={viendo}
          municipality={municipalityName(viendo, municipalities)}
          manageable={isManageable(viendo, user)}
          close={() => setViewId(null)}
        />
      )}
    </Card>
  )
}
