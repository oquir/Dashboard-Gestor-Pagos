import { CheckCircle, Edit, Send, Trash, Warning } from 'reicon-react'
import { useState } from 'react'
import { roleLabel, fullName, useSession } from '../../../../lib'
import { useData } from '../../../../store'
import { Badge, Button } from '../../../atoms'
import { Notice, DataItem, Modal } from '../../../molecules'
import UserFields, {
  dataOf,
  userErrors,
  hasErrors,
  ROLES_1CERO1,
  MUNICIPALITY_ROLES,
} from '../UserFields'
import type { UserData } from '../UserFields'
import type { UserDetailProps } from './UserDetail.types'

type Mode = 'view' | 'edit' | 'remove'

/**
 * Los datos de un usuario en una ventana, con lo que se puede hacer con él: editar sus datos (por ejemplo, el correo
 * cuando el municipio pierde el acceso al que tenía), reenviarle las credenciales, desactivarlo o reactivarlo, y
 * eliminarlo después de confirmar. En la demo, los correos no salen de verdad.
 */
export default function UserDetail({ user: u, municipality, manageable, close }: UserDetailProps) {
  const { user: current } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const saveUser = useData((s) => s.saveUser)
  const toggleUser = useData((s) => s.toggleUser)
  const removeUser = useData((s) => s.removeUser)
  const is1cero1 = current?.role === '1cero1'
  const [mode, setMode] = useState<Mode>('view')
  const [data, setData] = useState<UserData>(() => dataOf(u, municipalities[0].id))
  const [attempted, setAttempted] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const edit = () => {
    setData(dataOf(u, municipalities[0].id))
    setAttempted(false)
    setNotice(null)
    setMode('edit')
  }

  const save = () => {
    setAttempted(true)
    if (hasErrors(userErrors(data))) return
    const email = data.email.trim()
    saveUser({
      ...u,
      firstNames: data.firstNames.trim(),
      lastNames: data.lastNames.trim(),
      jobTitle: data.jobTitle.trim() || roleLabel[data.role],
      email,
      role: data.role,
      municipalityId:
        data.role === '1cero1' ? null : is1cero1 ? data.municipalityId : u.municipalityId,
    })
    setNotice(
      email !== u.email
        ? `Se guardaron los cambios. El correo ahora es ${email}: reenvíale las credenciales para que pueda entrar.`
        : 'Se guardaron los cambios.',
    )
    setMode('view')
  }

  const remove = () => {
    removeUser(u.id)
    close()
  }

  const footer = !manageable ? (
    <Button onClick={close}>Cerrar</Button>
  ) : mode === 'edit' ? (
    <>
      <Button onClick={() => setMode('view')}>Cancelar</Button>
      <Button variant="primary" onClick={save}>
        Guardar cambios
      </Button>
    </>
  ) : mode === 'remove' ? (
    <>
      <Button onClick={() => setMode('view')}>Cancelar</Button>
      <Button variant="danger" onClick={remove}>
        <Trash className="size-4" aria-hidden /> Sí, eliminar
      </Button>
    </>
  ) : (
    <>
      <Button
        variant="ghost"
        className="mr-auto text-danger hover:bg-danger-surface"
        onClick={() => setMode('remove')}
      >
        <Trash className="size-4" aria-hidden /> Eliminar
      </Button>
      <Button onClick={edit}>
        <Edit className="size-4" aria-hidden /> Editar
      </Button>
      <Button onClick={() => toggleUser(u.id)}>{u.isActive ? 'Desactivar' : 'Reactivar'}</Button>
      <Button
        variant="primary"
        disabled={!u.isActive}
        title={u.isActive ? undefined : 'Reactívalo para poder reenviarle las credenciales'}
        onClick={() => setNotice(`Se enviaron las credenciales de acceso a ${u.email}.`)}
      >
        <Send className="size-4" aria-hidden /> Reenviar credenciales
      </Button>
    </>
  )

  return (
    <Modal
      title={mode === 'edit' ? 'Editar usuario' : fullName(u)}
      description={mode === 'edit' ? fullName(u) : u.jobTitle}
      close={close}
      footer={footer}
    >
      {mode === 'edit' ? (
        <UserFields
          data={data}
          change={setData}
          showErrors={attempted}
          roles={is1cero1 ? ROLES_1CERO1 : MUNICIPALITY_ROLES}
          municipalities={is1cero1 ? municipalities : undefined}
        />
      ) : (
        <dl className="grid gap-4 sm:grid-cols-2">
          <DataItem label="Nombres">{u.firstNames}</DataItem>
          <DataItem label="Apellidos">{u.lastNames}</DataItem>
          <DataItem label="Cargo">{u.jobTitle}</DataItem>
          <DataItem label="Correo">
            <span className="break-all">{u.email}</span>
          </DataItem>
          <DataItem label="Rol">
            <Badge tone={u.role === '1cero1' ? 'info' : 'neutral'}>{roleLabel[u.role]}</Badge>
          </DataItem>
          <DataItem label="Municipio">{municipality}</DataItem>
          <DataItem label="Estado">
            <Badge tone={u.isActive ? 'success' : 'neutral'}>
              {u.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </DataItem>
        </dl>
      )}

      <div className="mt-4 space-y-3 empty:hidden">
        {mode === 'view' && !u.isActive && manageable && (
          <Notice tone="neutral">No puede entrar al aplicativo mientras esté inactivo.</Notice>
        )}
        {mode === 'view' && notice && (
          <Notice tone="success" icon={CheckCircle} role="status">
            {notice}
          </Notice>
        )}
        {mode === 'remove' && (
          <Notice tone="danger" icon={Warning} role="alert">
            <p className="font-medium">¿Eliminar a {fullName(u)}?</p>
            <p className="mt-0.5">
              No se puede deshacer. Si solo quieres quitarle el acceso, mejor desactívalo.
            </p>
          </Notice>
        )}
        {!manageable && (
          <Notice tone="neutral">
            {u.id === current?.id
              ? 'No puedes cambiar tu propio usuario.'
              : 'Solo 1cero1 puede cambiar a los usuarios de 1cero1.'}
          </Notice>
        )}
      </div>
    </Modal>
  )
}
