import { Location } from 'reicon-react'
import { useNavigate } from 'react-router'
import { etiquetaImpuesto, formatoCompacto } from '../../../lib/formato'
import { IMPUESTOS } from '../../../lib/sesion'
import { useDatos } from '../../../store'
import type { Municipio } from '../../../types'
import { Badge, Boton, Card, Casilla } from '../../atoms'
import { Cifra, Interruptor } from '../../molecules'

/** Un municipio para 1cero1: sus cifras, lo que tiene activo en el aplicativo y el acceso a su tablero. */
export default function TarjetaMunicipio({ municipio: m, resumen: r }: {
  municipio: Municipio
  resumen: { activas: number; declaraciones: number; recaudo: number; usuarios: number }
}) {
  const alternarMunicipio = useDatos((s) => s.alternarMunicipio)
  const alternarImpuesto = useDatos((s) => s.alternarImpuesto)
  const alternarRit = useDatos((s) => s.alternarRit)
  const alternarValidacionRit = useDatos((s) => s.alternarValidacionRit)
  const alternarAprobacionPrevia = useDatos((s) => s.alternarAprobacionPrevia)
  const seleccionarMunicipio = useDatos((s) => s.seleccionarMunicipio)
  const navigate = useNavigate()

  return (
    <Card className={`p-5 ${m.activo ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{m.nombre}</p>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <Location className="size-3.5" aria-hidden /> {m.departamento} · DANE {m.codigoDane}
          </p>
        </div>
        <Badge tono={m.activo ? 'exito' : 'neutral'}>{m.activo ? 'Activo' : 'Inactivo'}</Badge>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4">
        <Cifra etiqueta="Inscripciones activas">{m.rit ? r.activas : <span className="text-sm font-normal text-slate-500">Sin RIT</span>}</Cifra>
        <Cifra etiqueta="Declaraciones">{r.declaraciones}</Cifra>
        <Cifra etiqueta="Recaudo 2026">${formatoCompacto(r.recaudo)}</Cifra>
        <Cifra etiqueta="Usuarios activos">{r.usuarios}</Cifra>
      </dl>
      <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
        <Interruptor etiqueta="RIT en el aplicativo" ayuda="Inscripciones, actualizaciones y cancelaciones." valor={m.rit} onChange={() => alternarRit(m.id)} />

        <div role="group" aria-label={`Formularios de ${m.nombre}`}>
          <p className="text-xs text-slate-500">Formularios</p>
          <ul className="mt-2 space-y-2">
            {IMPUESTOS.map((i) => {
              const unicoActivo = m.impuestos[i] && IMPUESTOS.filter((x) => m.impuestos[x]).length === 1
              return (
                <li key={i} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <label className="flex items-center gap-2 text-sm text-slate-700" title={unicoActivo ? 'Debe quedar al menos un formulario activo' : undefined}>
                    <Casilla checked={m.impuestos[i]} disabled={unicoActivo} onChange={() => alternarImpuesto(m.id, i)} />
                    {etiquetaImpuesto[i]}
                  </label>
                  {m.impuestos[i] && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <label className={`flex items-center gap-2 text-xs ${m.rit ? 'text-slate-600' : 'text-slate-400'}`} title={m.rit ? undefined : 'Requiere el RIT en el aplicativo'}>
                        <Casilla pequena checked={m.rit && m.validarContraRit[i]} disabled={!m.rit} onChange={() => alternarValidacionRit(m.id, i)} />
                        Validar contra el RIT
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <Casilla pequena checked={m.aprobacionPrevia[i]} onChange={() => alternarAprobacionPrevia(m.id, i)} />
                        Aprobación previa
                      </label>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          {!m.rit && <p className="mt-2 text-xs text-slate-500">Sin el RIT en el aplicativo, los formularios no se validan contra él.</p>}
          {IMPUESTOS.some((i) => m.impuestos[i] && m.aprobacionPrevia[i]) && (
            <p className="mt-2 text-xs text-slate-500">Con aprobación previa, el contribuyente paga cuando el municipio aprueba. Aplica a lo que se radique desde que se activa.</p>
          )}
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
}
