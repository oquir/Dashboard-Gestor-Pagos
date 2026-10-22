import { MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Badge, Boton, Card, PageHeader } from '../components/ui'
import { etiquetaImpuesto, formatoCompacto } from '../lib/formato'
import { puede } from '../lib/permisos'
import { IMPUESTOS, impuestoActivo, useSesion } from '../lib/sesion'
import { useDatos } from '../store'

export default function Municipios() {
  const { usuario } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const inscripciones = useDatos((s) => s.inscripciones)
  const declaraciones = useDatos((s) => s.declaraciones)
  const pagos = useDatos((s) => s.pagos)
  const usuarios = useDatos((s) => s.usuarios)
  const alternarMunicipio = useDatos((s) => s.alternarMunicipio)
  const alternarImpuesto = useDatos((s) => s.alternarImpuesto)
  const alternarRit = useDatos((s) => s.alternarRit)
  const alternarValidacionRit = useDatos((s) => s.alternarValidacionRit)
  const seleccionarMunicipio = useDatos((s) => s.seleccionarMunicipio)
  const navigate = useNavigate()

  const resumen = useMemo(() => {
    const visibles = declaraciones.filter(impuestoActivo(municipios))
    const municipioDe = new Map(visibles.map((d) => [d.id, d.municipioId]))
    return new Map(
      municipios.map((m) => [
        m.id,
        {
          activas: inscripciones.filter((i) => i.municipioId === m.id && i.estado === 'activa').length,
          declaraciones: visibles.filter((d) => d.municipioId === m.id).length,
          recaudo: pagos.filter((p) => municipioDe.get(p.declaracionId) === m.id && p.fecha.startsWith('2026')).reduce((s, p) => s + p.valor, 0),
          usuarios: usuarios.filter((u) => u.municipioId === m.id && u.activo).length,
        },
      ]),
    )
  }, [municipios, inscripciones, declaraciones, pagos, usuarios])

  if (!puede(usuario?.rol, 'gestionarMunicipios')) return <Navigate to="/" replace />

  return (
    <>
      <PageHeader titulo="Municipios" descripcion="Municipios que usan el aplicativo: si tienen el RIT, qué formularios gestionan y si cada formulario se valida contra el RIT. Desactivar un municipio le quita el acceso a sus usuarios en la demo." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {municipios.map((m) => {
          const r = resumen.get(m.id)!
          return (
            <Card key={m.id} className={`p-5 ${m.activo ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{m.nombre}</p>
                  <p className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="size-3.5" aria-hidden /> {m.departamento} · DANE {m.codigoDane}
                  </p>
                </div>
                <Badge tono={m.activo ? 'exito' : 'neutral'}>{m.activo ? 'Activo' : 'Inactivo'}</Badge>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-slate-500">Inscripciones activas</dt>
                  <dd className="text-lg font-semibold text-slate-900">{m.rit ? r.activas : <span className="text-sm font-normal text-slate-500">Sin RIT</span>}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Declaraciones</dt>
                  <dd className="text-lg font-semibold text-slate-900">{r.declaraciones}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Recaudo 2026</dt>
                  <dd className="text-lg font-semibold text-slate-900">${formatoCompacto(r.recaudo)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Usuarios activos</dt>
                  <dd className="text-lg font-semibold text-slate-900">{r.usuarios}</dd>
                </div>
              </dl>
              <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="mt-0.5 size-4 accent-brand-600" checked={m.rit} onChange={() => alternarRit(m.id)} />
                  <span>
                    <span className="block text-sm font-medium text-slate-700">RIT en el aplicativo</span>
                    <span className="block text-xs text-slate-500">Inscripciones, actualizaciones y cancelaciones.</span>
                  </span>
                </label>

                <div role="group" aria-label={`Formularios de ${m.nombre}`}>
                  <p className="text-xs text-slate-500">Formularios</p>
                  <ul className="mt-2 space-y-2">
                    {IMPUESTOS.map((i) => {
                      const unicoActivo = m.impuestos[i] && IMPUESTOS.filter((x) => m.impuestos[x]).length === 1
                      return (
                        <li key={i} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                          <label className="flex items-center gap-2 text-sm text-slate-700" title={unicoActivo ? 'Debe quedar al menos un formulario activo' : undefined}>
                            <input type="checkbox" className="size-4 accent-brand-600" checked={m.impuestos[i]} disabled={unicoActivo} onChange={() => alternarImpuesto(m.id, i)} />
                            {etiquetaImpuesto[i]}
                          </label>
                          {m.impuestos[i] && (
                            <label className={`flex items-center gap-2 text-xs ${m.rit ? 'text-slate-600' : 'text-slate-400'}`} title={m.rit ? undefined : 'Requiere el RIT en el aplicativo'}>
                              <input
                                type="checkbox"
                                className="size-3.5 accent-brand-600"
                                checked={m.rit && m.validarContraRit[i]}
                                disabled={!m.rit}
                                onChange={() => alternarValidacionRit(m.id, i)}
                              />
                              Validar contra el RIT
                            </label>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                  {!m.rit && <p className="mt-2 text-xs text-slate-500">Sin el RIT en el aplicativo, los formularios no se validan contra él.</p>}
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Boton variante="secundario" onClick={() => { seleccionarMunicipio(m.id); navigate('/') }}>
                  Ver tablero
                </Boton>
                <Boton variante="fantasma" onClick={() => alternarMunicipio(m.id)}>
                  {m.activo ? 'Desactivar' : 'Activar'}
                </Boton>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
