import { Courthouse } from 'reicon-react'
import { Navigate, useNavigate } from 'react-router'
import { Badge, Card } from '../../components/atoms'
import { roleLabel, fullName } from '../../lib'
import { useData } from '../../store'
import { ROLE_DESCRIPTION, ORDER } from './Login.constants'

export default function Login() {
  const userId = useData((s) => s.userId)
  const users = useData((s) => s.users)
  const municipalities = useData((s) => s.municipalities)
  const logIn = useData((s) => s.logIn)
  const navigate = useNavigate()

  if (userId) return <Navigate to="/" replace />

  const enter = (id: string) => {
    logIn(id)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Courthouse className="size-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Gestor de Pagos</h1>
            <p className="text-sm text-slate-500">
              Industria y comercio, ReteICA, AutoReteICA y RIT · demo con datos simulados
            </p>
          </div>
        </div>

        <h2 className="mb-1 text-lg font-semibold text-slate-900">Elige con qué usuario entrar</h2>
        <p className="mb-6 text-sm text-slate-500">
          No hay contraseñas: es una demo para validar cómo se verá el aplicativo con cada rol.
        </p>

        <div className="space-y-8">
          {ORDER.map((role) => (
            <section key={role}>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-slate-900">{roleLabel[role]}</h3>
                <p className="text-sm text-slate-500">{ROLE_DESCRIPTION[role]}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {users
                  .filter(
                    (u) =>
                      u.role === role &&
                      u.isActive &&
                      (u.municipalityId === null ||
                        municipalities.find((m) => m.id === u.municipalityId)?.isActive),
                  )
                  .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => enter(u.id)}
                      className="text-left"
                    >
                      <Card className="h-full p-4 transition hover:border-brand-300 hover:shadow-md">
                        <p className="font-medium text-slate-900">{fullName(u)}</p>
                        <p className="text-sm text-slate-500">{u.jobTitle}</p>
                        <div className="mt-3">
                          <Badge tone={role === '1cero1' ? 'info' : 'neutral'}>
                            {municipalities.find((m) => m.id === u.municipalityId)?.name ??
                              'Todos los municipios'}
                          </Badge>
                        </div>
                      </Card>
                    </button>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
