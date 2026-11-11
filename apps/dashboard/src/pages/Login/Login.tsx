import { Courthouse } from 'reicon-react'
import { Navigate, useNavigate } from 'react-router'
import { Badge, Card } from '../../components/atoms'
import { etiquetaRol, nombreCompleto } from '../../lib/formato'
import { useDatos } from '../../store'
import { DESCRIPCION_ROL, ORDEN } from './constants'

export default function Login() {
  const usuarioId = useDatos((s) => s.usuarioId)
  const usuarios = useDatos((s) => s.usuarios)
  const municipios = useDatos((s) => s.municipios)
  const iniciarSesion = useDatos((s) => s.iniciarSesion)
  const navigate = useNavigate()

  if (usuarioId) return <Navigate to="/" replace />

  const entrar = (id: string) => {
    iniciarSesion(id)
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
            <p className="text-sm text-slate-500">Industria y comercio, ReteICA, AutoReteICA y RIT · demo con datos simulados</p>
          </div>
        </div>

        <h2 className="mb-1 text-lg font-semibold text-slate-900">Elige con qué usuario entrar</h2>
        <p className="mb-6 text-sm text-slate-500">No hay contraseñas: es una demo para validar cómo se verá el aplicativo con cada rol.</p>

        <div className="space-y-8">
          {ORDEN.map((rol) => (
            <section key={rol}>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-slate-900">{etiquetaRol[rol]}</h3>
                <p className="text-sm text-slate-500">{DESCRIPCION_ROL[rol]}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {usuarios
                  .filter((u) => u.rol === rol && u.activo && (u.municipioId === null || municipios.find((m) => m.id === u.municipioId)?.activo))
                  .map((u) => (
                    <button key={u.id} type="button" onClick={() => entrar(u.id)} className="text-left">
                      <Card className="h-full p-4 transition hover:border-brand-300 hover:shadow-md">
                        <p className="font-medium text-slate-900">{nombreCompleto(u)}</p>
                        <p className="text-sm text-slate-500">{u.cargo}</p>
                        <div className="mt-3">
                          <Badge tono={rol === '1cero1' ? 'info' : 'neutral'}>
                            {municipios.find((m) => m.id === u.municipioId)?.nombre ?? 'Todos los municipios'}
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
