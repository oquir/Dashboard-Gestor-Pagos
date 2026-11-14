import { Courthouse } from 'reicon-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { Badge, Button, Card, Input } from '../../components/atoms'
import { Field } from '../../components/molecules'
import { canLogIn, fullName, roleLabel } from '../../lib'
import { useData } from '../../store'
import { DEMO_CREDENTIALS, INVALID_CREDENTIALS } from './LoginCredentials.constants'

export default function LoginCredentials() {
  const { userId: chosenId } = useParams()
  const sessionId = useData((s) => s.userId)
  const users = useData((s) => s.users)
  const municipalities = useData((s) => s.municipalities)
  const logIn = useData((s) => s.logIn)
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (sessionId) return <Navigate to="/" replace />
  const user = users.find((u) => u.id === chosenId)
  if (!user || !canLogIn(user, municipalities)) return <Navigate to="/login" replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (username.trim() === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
      logIn(user.id)
      navigate('/')
    } else {
      setError(INVALID_CREDENTIALS)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-surface to-surface-sunken px-4 py-12">
      <div className="mx-auto max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand text-on-brand">
            <Courthouse className="size-6" aria-hidden />
          </span>
          <h1 className="text-2xl font-semibold text-fg-strong">Gestor de Pagos</h1>
        </div>

        <Card className="p-6">
          <div className="mb-5">
            <p className="font-medium text-fg-strong">{fullName(user)}</p>
            <p className="text-sm text-fg-muted">{roleLabel[user.role]}</p>
            <div className="mt-2">
              <Badge tone={user.role === '1cero1' ? 'info' : 'neutral'}>
                {municipalities.find((m) => m.id === user.municipalityId)?.name ??
                  'Todos los municipios'}
              </Badge>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Usuario">
              <Input
                value={username}
                autoComplete="username"
                autoFocus
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
              />
            </Field>
            <Field label="Contraseña" error={error}>
              <Input
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
              />
            </Field>
            <Button type="submit" className="w-full">
              Ingresar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Elegir otro usuario
            </Button>
          </form>
          <p className="mt-4 text-xs text-fg-muted">Demo: usuario admin, contraseña admin</p>
        </Card>
      </div>
    </div>
  )
}
